import { UserSession } from '../models';
import { menuService } from './menu.service';
import { orderService } from './order.service';
import { paymentService } from './payment.service';
import { IBotResponse, SessionState } from '../types';
import {
  BOT_MESSAGES,
  MAIN_MENU_OPTIONS,
  ORDERING_OPTIONS,
  SCHEDULING_OPTIONS,
} from '../utils/constants';
import {
  formatOrderItems,
  formatDate,
  isValidNumber,
  sanitizeInput,
  parseScheduleDate,
} from '../utils/helpers';

export class ChatbotService {
  /**
   * Get or create user session
   */
  async getOrCreateSession(sessionId: string): Promise<{ state: SessionState }> {
    let session = await UserSession.findOne({ sessionId });

    if (!session) {
      session = new UserSession({
        sessionId,
        state: 'idle',
      });
      await session.save();
    }

    return { state: session.state };
  }

  /**
   * Get welcome message
   */
  getWelcomeMessage(): IBotResponse {
    return {
      message: BOT_MESSAGES.WELCOME + BOT_MESSAGES.MAIN_OPTIONS,
    };
  }

  /**
   * Process user input and return bot response
   */
  async processInput(sessionId: string, input: string): Promise<IBotResponse> {
    const sanitizedInput = sanitizeInput(input);

    // Get current session state
    const session = await this.getOrCreateSession(sessionId);

    // Route based on state
    switch (session.state) {
      case 'ordering':
        return this.handleOrderingState(sessionId, sanitizedInput);
      case 'scheduling':
        return this.handleSchedulingState(sessionId, sanitizedInput);
      case 'checkout':
      case 'idle':
      default:
        return this.handleIdleState(sessionId, sanitizedInput);
    }
  }

  /**
   * Handle idle state (main menu)
   */
  private async handleIdleState(
    sessionId: string,
    input: string
  ): Promise<IBotResponse> {
    switch (input) {
      case MAIN_MENU_OPTIONS.PLACE_ORDER:
        return this.startOrdering(sessionId);

      case MAIN_MENU_OPTIONS.CHECKOUT:
        return this.handleCheckout(sessionId);

      case MAIN_MENU_OPTIONS.ORDER_HISTORY:
        return this.getOrderHistory(sessionId);

      case MAIN_MENU_OPTIONS.CURRENT_ORDER:
        return this.getCurrentOrder(sessionId);

      case MAIN_MENU_OPTIONS.CANCEL_ORDER:
        return this.cancelOrder(sessionId);

      default:
        return {
          message: BOT_MESSAGES.INVALID_OPTION + BOT_MESSAGES.MAIN_OPTIONS,
        };
    }
  }

  /**
   * Handle ordering state (selecting menu items)
   */
  private async handleOrderingState(
    sessionId: string,
    input: string
  ): Promise<IBotResponse> {
    // Check for special commands while ordering
    switch (input) {
      case ORDERING_OPTIONS.CHECKOUT:
        return this.handleCheckout(sessionId);

      case ORDERING_OPTIONS.CURRENT_ORDER:
        return this.getCurrentOrder(sessionId);

      case ORDERING_OPTIONS.CANCEL:
        return this.cancelOrder(sessionId);
    }

    // Validate numeric input for menu item
    if (!isValidNumber(input)) {
      return {
        message: BOT_MESSAGES.INVALID_MENU_ITEM + '\n\n' + (await menuService.getFormattedMenu()),
      };
    }

    const itemNumber = parseInt(input, 10);

    // Check if valid menu item
    const isValid = await menuService.isValidItemNumber(itemNumber);
    if (!isValid) {
      return {
        message: BOT_MESSAGES.INVALID_MENU_ITEM + '\n\n' + (await menuService.getFormattedMenu()),
      };
    }

    // Add item to order
    const order = await orderService.addItemToOrder(sessionId, itemNumber, 1);

    if (!order) {
      return {
        message: BOT_MESSAGES.ERROR,
      };
    }

    // Find the added item name
    const menuItem = await menuService.getItemByNumber(itemNumber);
    const itemName = menuItem?.name || 'Item';

    return {
      message: BOT_MESSAGES.ITEM_ADDED(itemName, 1),
    };
  }

  /**
   * Handle scheduling state
   */
  private async handleSchedulingState(
    sessionId: string,
    input: string
  ): Promise<IBotResponse> {
    // Check if user wants to schedule or not
    if (input === SCHEDULING_OPTIONS.NO) {
      // Don't schedule, just complete
      await UserSession.findOneAndUpdate({ sessionId }, { state: 'idle' });

      const order = await orderService.getMostRecentPlacedOrder(sessionId);
      if (order) {
        return {
          message: BOT_MESSAGES.CHECKOUT_SUCCESS(order.totalAmount),
          showPayButton: true,
        };
      }
      return {
        message: BOT_MESSAGES.NO_ORDER_TO_PLACE,
      };
    }

    if (input === SCHEDULING_OPTIONS.YES) {
      return {
        message: BOT_MESSAGES.SCHEDULE_TIME_PROMPT,
      };
    }

    // Try to parse as a date
    const scheduledDate = parseScheduleDate(input);
    if (scheduledDate) {
      const order = await orderService.getMostRecentPlacedOrder(sessionId);
      if (order) {
        await orderService.scheduleOrder(order._id.toString(), scheduledDate);
        await UserSession.findOneAndUpdate({ sessionId }, { state: 'idle' });

        return {
          message: BOT_MESSAGES.ORDER_SCHEDULED(formatDate(scheduledDate)),
          showPayButton: true,
        };
      }
    }

    return {
      message: `I couldn't understand that date. Please try again with a format like "2024-12-25 14:30" or "tomorrow 2pm".`,
    };
  }

  /**
   * Start ordering - show menu
   */
  private async startOrdering(sessionId: string): Promise<IBotResponse> {
    // Update session state
    await UserSession.findOneAndUpdate(
      { sessionId },
      { state: 'ordering' },
      { upsert: true }
    );

    // Get formatted menu
    const menu = await menuService.getFormattedMenu();

    return {
      message: BOT_MESSAGES.MENU_HEADER + '\n' + menu,
    };
  }

  /**
   * Handle checkout
   */
  private async handleCheckout(sessionId: string): Promise<IBotResponse> {
    // Get current order
    const currentOrder = await orderService.getCurrentOrder(sessionId);

    if (!currentOrder || currentOrder.items.length === 0) {
      // Check if there's a placed order waiting for payment
      const placedOrder = await orderService.getMostRecentPlacedOrder(sessionId);
      if (placedOrder) {
        return {
          message: `You have an order waiting for payment.\n\nTotal: ₦${placedOrder.totalAmount.toLocaleString()}\n\nPlease proceed to pay.`,
          showPayButton: true,
        };
      }

      return {
        message: BOT_MESSAGES.NO_ORDER_TO_PLACE,
      };
    }

    // Place the order
    const placedOrder = await orderService.placeOrder(sessionId);

    if (!placedOrder) {
      return {
        message: BOT_MESSAGES.ERROR,
      };
    }

    // Ask about scheduling
    await UserSession.findOneAndUpdate({ sessionId }, { state: 'scheduling' });

    return {
      message: `Order total: ₦${placedOrder.totalAmount.toLocaleString()}\n\n${BOT_MESSAGES.SCHEDULING_PROMPT}`,
    };
  }

  /**
   * Get current order
   */
  private async getCurrentOrder(sessionId: string): Promise<IBotResponse> {
    const order = await orderService.getCurrentOrder(sessionId);

    if (!order || order.items.length === 0) {
      return {
        message: BOT_MESSAGES.NO_CURRENT_ORDER,
      };
    }

    const itemsFormatted = formatOrderItems(order.items);

    return {
      message: BOT_MESSAGES.CURRENT_ORDER(itemsFormatted, order.totalAmount),
    };
  }

  /**
   * Cancel current order
   */
  private async cancelOrder(sessionId: string): Promise<IBotResponse> {
    const cancelled = await orderService.cancelOrder(sessionId);

    if (cancelled) {
      return {
        message: BOT_MESSAGES.ORDER_CANCELLED,
      };
    }

    return {
      message: BOT_MESSAGES.NO_ORDER_TO_CANCEL,
    };
  }

  /**
   * Get order history
   */
  private async getOrderHistory(sessionId: string): Promise<IBotResponse> {
    const orders = await orderService.getOrderHistory(sessionId);

    if (orders.length === 0) {
      return {
        message: BOT_MESSAGES.NO_ORDER_HISTORY,
      };
    }

    let historyText = BOT_MESSAGES.ORDER_HISTORY_HEADER + '\n\n';

    orders.forEach((order, index) => {
      const statusEmoji =
        order.status === 'paid' ? '✅' : order.status === 'placed' ? '⏳' : '';
      const scheduledText = order.scheduledFor
        ? `\n   Scheduled: ${formatDate(order.scheduledFor)}`
        : '';

      historyText += `${index + 1}. Order #${order._id.toString().slice(-6)} ${statusEmoji}\n`;
      historyText += `   Date: ${formatDate(order.createdAt)}\n`;
      historyText += `   Items: ${order.items.length}\n`;
      historyText += `   Total: ₦${order.totalAmount.toLocaleString()}\n`;
      historyText += `   Status: ${order.status.toUpperCase()}${scheduledText}\n\n`;
    });

    historyText += '\nSelect 1 to Place a new order';

    return {
      message: historyText,
    };
  }

  /**
   * Initialize payment for checkout
   */
  async initializePayment(
    sessionId: string,
    email?: string
  ): Promise<IBotResponse & { paymentUrl?: string }> {
    const result = await paymentService.initializeOrderPayment(sessionId, email);

    if (result.success) {
      return {
        message: `Payment initialized. Total: ₦${result.amount?.toLocaleString()}\n\nRedirecting to payment page...`,
        paymentUrl: result.authorizationUrl,
      };
    }

    return {
      message: result.message + BOT_MESSAGES.MAIN_OPTIONS,
    };
  }

  /**
   * Handle payment callback
   */
  async handlePaymentCallback(reference: string): Promise<IBotResponse> {
    const result = await paymentService.verifyAndCompletePayment(reference);

    if (result.success) {
      return {
        message: BOT_MESSAGES.PAYMENT_SUCCESS,
      };
    }

    return {
      message: BOT_MESSAGES.PAYMENT_FAILED,
    };
  }
}

export const chatbotService = new ChatbotService();

import { Order, UserSession, MenuItem } from '../models';
import { IOrder, IOrderItem, OrderStatus } from '../types';
import { Types } from 'mongoose';

export class OrderService {
  /**
   * Create a new pending order for a session
   */
  async createOrder(sessionId: string): Promise<IOrder> {
    const order = new Order({
      sessionId,
      items: [],
      totalAmount: 0,
      status: 'pending',
    });

    await order.save();

    // Update user session with current order
    await UserSession.findOneAndUpdate(
      { sessionId },
      { currentOrder: order._id, state: 'ordering' },
      { upsert: true }
    );

    return order;
  }

  /**
   * Get current pending order for a session
   */
  async getCurrentOrder(sessionId: string): Promise<IOrder | null> {
    return Order.findOne({ sessionId, status: 'pending' }).populate('items.menuItem');
  }

  /**
   * Add item to current order
   */
  async addItemToOrder(
    sessionId: string,
    itemNumber: number,
    quantity: number = 1
  ): Promise<IOrder | null> {
    // Get the menu item
    const menuItem = await MenuItem.findOne({ itemNumber, available: true });
    if (!menuItem) {
      return null;
    }

    // Get or create current order
    let order = await this.getCurrentOrder(sessionId);
    if (!order) {
      order = await this.createOrder(sessionId);
    }

    // Check if item already exists in order
    const existingItemIndex = order.items.findIndex(
      (item) => item.menuItem.toString() === menuItem._id.toString()
    );

    if (existingItemIndex >= 0) {
      // Increase quantity
      order.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: IOrderItem = {
        menuItem: menuItem._id as Types.ObjectId,
        name: menuItem.name,
        quantity,
        price: menuItem.price,
      };
      order.items.push(newItem);
    }

    await order.save();
    return order;
  }

  /**
   * Place order (change status from pending to placed)
   */
  async placeOrder(sessionId: string): Promise<IOrder | null> {
    const order = await Order.findOneAndUpdate(
      { sessionId, status: 'pending' },
      { status: 'placed' },
      { new: true }
    );

    if (order) {
      // Clear current order from session but keep state for checkout
      await UserSession.findOneAndUpdate(
        { sessionId },
        { currentOrder: null, state: 'checkout' }
      );
    }

    return order;
  }

  /**
   * Cancel current order
   */
  async cancelOrder(sessionId: string): Promise<boolean> {
    const result = await Order.findOneAndUpdate(
      { sessionId, status: 'pending' },
      { status: 'cancelled' }
    );

    if (result) {
      await UserSession.findOneAndUpdate(
        { sessionId },
        { currentOrder: null, state: 'idle' }
      );
      return true;
    }

    return false;
  }

  /**
   * Get order history for a session (placed and paid orders)
   */
  async getOrderHistory(sessionId: string): Promise<IOrder[]> {
    return Order.find({
      sessionId,
      status: { $in: ['placed', 'paid'] },
    }).sort({ createdAt: -1 });
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<IOrder | null> {
    return Order.findById(orderId);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }

  /**
   * Update order with payment reference
   */
  async updatePaymentReference(
    orderId: string,
    reference: string
  ): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      orderId,
      { paymentReference: reference },
      { new: true }
    );
  }

  /**
   * Mark order as paid
   */
  async markOrderAsPaid(reference: string): Promise<IOrder | null> {
    const order = await Order.findOneAndUpdate(
      { paymentReference: reference },
      { status: 'paid' },
      { new: true }
    );

    if (order) {
      await UserSession.findOneAndUpdate(
        { sessionId: order.sessionId },
        { state: 'idle' }
      );
    }

    return order;
  }

  /**
   * Get most recent placed order for payment
   */
  async getMostRecentPlacedOrder(sessionId: string): Promise<IOrder | null> {
    return Order.findOne({
      sessionId,
      status: 'placed',
    }).sort({ createdAt: -1 });
  }

  /**
   * Schedule an order
   */
  async scheduleOrder(orderId: string, scheduledDate: Date): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      orderId,
      { scheduledFor: scheduledDate },
      { new: true }
    );
  }

  /**
   * Check if session has pending order
   */
  async hasPendingOrder(sessionId: string): Promise<boolean> {
    const count = await Order.countDocuments({ sessionId, status: 'pending' });
    return count > 0;
  }
}

export const orderService = new OrderService();

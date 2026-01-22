import { initializePayment, verifyPayment } from '../config/paystack';
import { orderService } from './order.service';
import { generatePaymentReference, toKobo, generateTempEmail } from '../utils/helpers';
import { IOrder } from '../types';

export class PaymentService {
  /**
   * Initialize payment for an order
   */
  async initializeOrderPayment(
    sessionId: string,
    email?: string
  ): Promise<{
    success: boolean;
    message: string;
    authorizationUrl?: string;
    reference?: string;
    amount?: number;
  }> {
    try {
      // Get the most recent placed order
      const order = await orderService.getMostRecentPlacedOrder(sessionId);

      if (!order) {
        return {
          success: false,
          message: 'No order found to pay for. Please place an order first.',
        };
      }

      // Generate payment reference
      const reference = generatePaymentReference();

      // Use provided email or generate a temp one
      const paymentEmail = email || generateTempEmail(sessionId);

      // Calculate amount in kobo
      const amountInKobo = toKobo(order.totalAmount);

      // Build callback URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const callbackUrl = `${baseUrl}/api/payment/callback`;

      // Initialize payment with Paystack
      const response = await initializePayment(
        paymentEmail,
        amountInKobo,
        reference,
        callbackUrl
      );

      if (response.status) {
        // Update order with payment reference
        await orderService.updatePaymentReference(
          order._id.toString(),
          reference
        );

        return {
          success: true,
          message: 'Payment initialized successfully',
          authorizationUrl: response.data.authorization_url,
          reference: response.data.reference,
          amount: order.totalAmount,
        };
      }

      return {
        success: false,
        message: 'Failed to initialize payment. Please try again.',
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: 'An error occurred while initializing payment.',
      };
    }
  }

  /**
   * Verify payment and update order
   */
  async verifyAndCompletePayment(reference: string): Promise<{
    success: boolean;
    message: string;
    order?: IOrder;
  }> {
    try {
      // Verify payment with Paystack
      const response = await verifyPayment(reference);

      if (response.status && response.data.status === 'success') {
        // Mark order as paid
        const order = await orderService.markOrderAsPaid(reference);

        if (order) {
          return {
            success: true,
            message: 'Payment verified successfully',
            order,
          };
        }

        return {
          success: false,
          message: 'Order not found for this payment reference.',
        };
      }

      return {
        success: false,
        message: `Payment verification failed: ${response.data.status}`,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'An error occurred while verifying payment.',
      };
    }
  }

  /**
   * Get payment status by reference
   */
  async getPaymentStatus(reference: string): Promise<{
    status: string;
    message: string;
  }> {
    try {
      const response = await verifyPayment(reference);

      return {
        status: response.data.status,
        message: response.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Could not verify payment status',
      };
    }
  }
}

export const paymentService = new PaymentService();

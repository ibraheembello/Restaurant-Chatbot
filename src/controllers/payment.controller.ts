import { Request, Response } from 'express';
import { chatbotService } from '../services';
import { paymentService } from '../services/payment.service';
import { getVisitorId } from '../middleware';

export class PaymentController {
  /**
   * Initialize payment
   */
  async initializePayment(req: Request, res: Response): Promise<void> {
    try {
      const visitorId = getVisitorId(req);
      const { email } = req.body;

      const result = await chatbotService.initializePayment(visitorId, email);

      if (result.paymentUrl) {
        res.json({
          success: true,
          data: {
            message: result.message,
            paymentUrl: result.paymentUrl,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
        });
      }
    } catch (error) {
      console.error('Payment init error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize payment',
      });
    }
  }

  /**
   * Handle Paystack callback (redirect from Paystack)
   */
  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { reference, trxref } = req.query;
      const paymentRef = (reference || trxref) as string;

      if (!paymentRef) {
        res.redirect('/?payment=error&message=No reference provided');
        return;
      }

      // Verify payment
      const result = await chatbotService.handlePaymentCallback(paymentRef);

      if (result.message.includes('successful')) {
        res.redirect('/?payment=success');
      } else {
        res.redirect('/?payment=failed');
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      res.redirect('/?payment=error');
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { reference } = req.params;

      const result = await paymentService.getPaymentStatus(reference);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Payment verify error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify payment',
      });
    }
  }

  /**
   * Get Paystack public key for frontend
   */
  getPublicKey(req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
      },
    });
  }
}

export const paymentController = new PaymentController();

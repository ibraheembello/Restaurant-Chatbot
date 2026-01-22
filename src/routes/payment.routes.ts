import { Router } from 'express';
import { paymentController } from '../controllers';
import {
  ensureVisitorSession,
  validateEmail,
  validatePaymentReference,
} from '../middleware';

const router = Router();

// Initialize payment
router.post(
  '/initialize',
  ensureVisitorSession,
  validateEmail,
  (req, res) => paymentController.initializePayment(req, res)
);

// Paystack callback (no session needed - redirect from Paystack)
router.get('/callback', (req, res) =>
  paymentController.handleCallback(req, res)
);

// Verify payment
router.get(
  '/verify/:reference',
  validatePaymentReference,
  (req, res) => paymentController.verifyPayment(req, res)
);

// Get public key for frontend
router.get('/public-key', (req, res) =>
  paymentController.getPublicKey(req, res)
);

export default router;

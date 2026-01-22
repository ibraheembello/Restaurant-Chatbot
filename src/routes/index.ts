import { Router } from 'express';
import chatRoutes from './chat.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/chat', chatRoutes);
router.use('/payment', paymentRoutes);

export default router;

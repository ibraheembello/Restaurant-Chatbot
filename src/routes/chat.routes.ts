import { Router } from 'express';
import { chatController } from '../controllers';
import { validateChatInput, ensureVisitorSession } from '../middleware';

const router = Router();

// Apply session middleware to all chat routes
router.use(ensureVisitorSession);

// Initialize chat and get welcome message
router.get('/init', (req, res) => chatController.initChat(req, res));

// Process user message
router.post('/message', validateChatInput, (req, res) =>
  chatController.processMessage(req, res)
);

// Get current session state
router.get('/session', (req, res) => chatController.getSessionState(req, res));

export default router;

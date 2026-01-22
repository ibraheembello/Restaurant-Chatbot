import { Request, Response } from 'express';
import { chatbotService } from '../services';
import { getVisitorId } from '../middleware';

export class ChatController {
  /**
   * Initialize chat session and get welcome message
   */
  async initChat(req: Request, res: Response): Promise<void> {
    try {
      const visitorId = getVisitorId(req);

      // Initialize session in database
      await chatbotService.getOrCreateSession(visitorId);

      // Get welcome message
      const response = chatbotService.getWelcomeMessage();

      res.json({
        success: true,
        data: {
          sessionId: visitorId,
          message: response.message,
          options: response.options,
        },
      });
    } catch (error) {
      console.error('Chat init error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize chat',
      });
    }
  }

  /**
   * Process user message
   */
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const visitorId = getVisitorId(req);
      const { message } = req.body;

      const response = await chatbotService.processInput(visitorId, message);

      res.json({
        success: true,
        data: {
          message: response.message,
          options: response.options,
          showPayButton: response.showPayButton || false,
        },
      });
    } catch (error) {
      console.error('Chat process error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message',
      });
    }
  }

  /**
   * Get current session state
   */
  async getSessionState(req: Request, res: Response): Promise<void> {
    try {
      const visitorId = getVisitorId(req);
      const session = await chatbotService.getOrCreateSession(visitorId);

      res.json({
        success: true,
        data: {
          sessionId: visitorId,
          state: session.state,
        },
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session state',
      });
    }
  }
}

export const chatController = new ChatController();

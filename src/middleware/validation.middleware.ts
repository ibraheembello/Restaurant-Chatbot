import { Request, Response, NextFunction } from 'express';

/**
 * Validate chat message input
 */
export const validateChatInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { message } = req.body;

  if (message === undefined || message === null) {
    res.status(400).json({
      success: false,
      error: 'Message is required',
    });
    return;
  }

  if (typeof message !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Message must be a string',
    });
    return;
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    res.status(400).json({
      success: false,
      error: 'Message cannot be empty',
    });
    return;
  }

  if (trimmedMessage.length > 500) {
    res.status(400).json({
      success: false,
      error: 'Message is too long. Maximum 500 characters allowed.',
    });
    return;
  }

  // Sanitize and attach to request
  req.body.message = trimmedMessage;
  next();
};

/**
 * Validate payment reference
 */
export const validatePaymentReference = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { reference } = req.params;

  if (!reference || typeof reference !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Payment reference is required',
    });
    return;
  }

  if (reference.length < 5 || reference.length > 100) {
    res.status(400).json({
      success: false,
      error: 'Invalid payment reference format',
    });
    return;
  }

  next();
};

/**
 * Validate email (optional)
 */
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;

  // Email is optional
  if (!email) {
    next();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      error: 'Invalid email format',
    });
    return;
  }

  next();
};

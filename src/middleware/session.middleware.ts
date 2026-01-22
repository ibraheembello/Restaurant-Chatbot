import { Request, Response, NextFunction } from 'express';
import { generateSessionId } from '../utils/helpers';

/**
 * Middleware to ensure a visitor ID exists in session
 * This creates device-based sessions without authentication
 */
export const ensureVisitorSession = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.session.visitorId) {
    req.session.visitorId = generateSessionId();
  }
  next();
};

/**
 * Get visitor ID from request
 */
export const getVisitorId = (req: Request): string => {
  return req.session.visitorId || '';
};

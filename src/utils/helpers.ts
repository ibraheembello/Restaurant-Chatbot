import { v4 as uuidv4 } from 'uuid';
import { IOrderItem } from '../types';

/**
 * Generate a unique reference for payments
 */
export const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `PAY_${timestamp}_${randomPart}`.toUpperCase();
};

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return uuidv4();
};

/**
 * Format currency in Naira
 */
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

/**
 * Convert amount to kobo for Paystack (NGN * 100)
 */
export const toKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert kobo to Naira
 */
export const fromKobo = (kobo: number): number => {
  return kobo / 100;
};

/**
 * Format order items as a readable string
 */
export const formatOrderItems = (items: IOrderItem[]): string => {
  if (!items || items.length === 0) {
    return 'No items';
  }

  return items
    .map((item, index) => {
      const itemTotal = item.price * item.quantity;
      return `${index + 1}. ${item.name} x${item.quantity} - ₦${itemTotal.toLocaleString()}`;
    })
    .join('\n');
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

/**
 * Parse schedule date from user input
 * Supports formats like "2024-12-25 14:30", "tomorrow 2pm", etc.
 */
export const parseScheduleDate = (input: string): Date | null => {
  const trimmed = input.trim().toLowerCase();

  // Try direct date parsing first
  const directParse = new Date(input);
  if (!isNaN(directParse.getTime()) && directParse > new Date()) {
    return directParse;
  }

  // Handle relative dates
  const now = new Date();

  if (trimmed.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Extract time if provided
    const timeMatch = trimmed.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2].slice(1)) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      tomorrow.setHours(hours, minutes, 0, 0);
    } else {
      tomorrow.setHours(12, 0, 0, 0); // Default to noon
    }

    return tomorrow;
  }

  return null;
};

/**
 * Validate if input is a valid number
 */
export const isValidNumber = (input: string): boolean => {
  return /^\d+$/.test(input.trim());
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Generate a random email for payment (when user doesn't provide one)
 * Uses a valid email format that Paystack will accept
 */
export const generateTempEmail = (sessionId: string): string => {
  const shortId = sessionId.substring(0, 8);
  return `customer_${shortId}@gmail.com`;
};

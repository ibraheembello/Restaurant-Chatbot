import { Document, Types } from 'mongoose';

// Session States
export type SessionState = 'idle' | 'ordering' | 'checkout' | 'scheduling';

// Order Status
export type OrderStatus = 'pending' | 'placed' | 'paid' | 'cancelled';

// Menu Item Interface
export interface IMenuItem extends Document {
  itemNumber: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Interface
export interface IOrderItem {
  menuItem: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

// Order Interface
export interface IOrder extends Document {
  sessionId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  scheduledFor?: Date;
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Session Interface
export interface IUserSession extends Document {
  sessionId: string;
  currentOrder?: Types.ObjectId;
  state: SessionState;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message Interface
export interface IChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  options?: string[];
}

// Bot Response Interface
export interface IBotResponse {
  message: string;
  options?: string[];
  showPayButton?: boolean;
  paymentData?: {
    reference: string;
    amount: number;
    email?: string;
    publicKey: string;
  };
}

// Paystack Interfaces
export interface IPaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface IPaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
  };
}

// Express Session Extension
declare module 'express-session' {
  interface SessionData {
    visitorId: string;
  }
}

import mongoose, { Schema } from 'mongoose';
import { IUserSession } from '../types';

const UserSessionSchema = new Schema<IUserSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentOrder: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    state: {
      type: String,
      enum: ['idle', 'ordering', 'checkout', 'scheduling'],
      default: 'idle',
    },
  },
  {
    timestamps: true,
  }
);

export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);

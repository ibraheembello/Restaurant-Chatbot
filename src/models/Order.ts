import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

const OrderItemSchema = new Schema(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'placed', 'paid', 'cancelled'],
      default: 'pending',
    },
    scheduledFor: {
      type: Date,
      required: false,
    },
    paymentReference: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
OrderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  } else {
    this.totalAmount = 0;
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

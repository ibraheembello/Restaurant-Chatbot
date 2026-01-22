import mongoose, { Schema } from 'mongoose';
import { IMenuItem } from '../types';

const MenuItemSchema = new Schema<IMenuItem>(
  {
    itemNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

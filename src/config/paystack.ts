import axios from 'axios';
import { IPaystackInitializeResponse, IPaystackVerifyResponse } from '../types';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getPaystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

export const paystackConfig = {
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  baseUrl: PAYSTACK_BASE_URL,
};

export const initializePayment = async (
  email: string,
  amount: number, // Amount in kobo (NGN * 100)
  reference: string,
  callbackUrl: string
): Promise<IPaystackInitializeResponse> => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount,
        reference,
        callback_url: callbackUrl,
        currency: 'NGN',
      },
      { headers: getPaystackHeaders() }
    );

    return response.data;
  } catch (error: any) {
    console.error('Paystack initialize error:', error.response?.data || error.message);
    throw new Error('Failed to initialize payment');
  }
};

export const verifyPayment = async (reference: string): Promise<IPaystackVerifyResponse> => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: getPaystackHeaders() }
    );

    return response.data;
  } catch (error: any) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    throw new Error('Failed to verify payment');
  }
};

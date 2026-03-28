export interface Payment {
  id: number;
  reference: string;
  amount: number;
  currency: Currency;
  createdAt: string;
  clientRequestId: string;
}

export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP';

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'INR', 'GBP'];

export interface CreatePaymentRequest {
  clientRequestId: string;
  amount: number;
  currency: Currency;
}

export interface UpdatePaymentRequest {
  amount: number;
  currency: Currency;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

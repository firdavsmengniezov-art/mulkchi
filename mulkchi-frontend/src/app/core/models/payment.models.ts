export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Card' | 'Cash' | 'Transfer' | 'Payme' | 'Click';

export interface Payment {
  id: string;
  homeRequestId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdDate: string;
  updatedDate: string;
}

export type PaymentType =
  | 'BookingPayment'
  | 'SecurityDeposit'
  | 'Refund'
  | 'PlatformFee';
export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';
export type PaymentMethod = 'Payme' | 'Click' | 'Uzcard' | 'Humo' | 'Cash';

export interface Payment {
  id: string;
  amount: number;
  platformFee: number;
  hostReceives: number;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  isEscrowHeld: boolean;
  escrowReleasedAt?: string;
  externalTransactionId?: string;
  paymentUrl?: string;
  payerId: string;
  receiverId: string;
  homeRequestId?: string;
  contractId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}

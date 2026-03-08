export enum PaymentType { BookingPayment = 0, SecurityDeposit = 1, Refund = 2, PlatformFee = 3 }
export enum PaymentStatus { Pending = 0, Processing = 1, Completed = 2, Failed = 3, Refunded = 4, Cancelled = 5 }
export enum PaymentMethod { Payme = 0, Click = 1, Uzcard = 2, Humo = 3, Cash = 4 }

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

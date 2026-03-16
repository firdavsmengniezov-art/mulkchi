export interface Payment {
  id: string;
  bookingId: string;
  payerId: string;
  receiverId: string;
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
  homeRequestId?: string;
  contractId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
  booking?: Booking;
  payer?: User;
  receiver?: User;
}

export enum PaymentType {
  Booking = 'Booking',
  Refund = 'Refund',
  Withdrawal = 'Withdrawal',
  Deposit = 'Deposit'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded',
  Cancelled = 'Cancelled'
}

export enum PaymentMethod {
  Card = 'Card',
  Cash = 'Cash',
  BankTransfer = 'BankTransfer',
  Payme = 'Payme',
  Click = 'Click',
  Uzum = 'Uzum'
}

export interface CreatePaymentRequest {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  description?: string;
}

export interface PaymentSummary {
  totalPaid: number;
  totalReceived: number;
  pendingAmount: number;
  currency: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  property?: Property;
  guestId: string;
  guest?: User;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  notes?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  listingType: string;
  monthlyRent?: number;
  salePrice?: number;
  pricePerNight?: number;
  area: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  maxGuests?: number;
  region: string;
  city: string;
  district: string;
  address: string;
  mahalla: string;
  latitude?: number;
  longitude?: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasElevator: boolean;
  hasSecurity: boolean;
  hasGenerator: boolean;
  hasGas: boolean;
  hasFurniture: boolean;
  isRenovated: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasWasher: boolean;
  hasKitchen: boolean;
  hasTV: boolean;
  hasWorkspace: boolean;
  isSelfCheckIn: boolean;
  isChildFriendly: boolean;
  isAccessible: boolean;
  averageRating: number;
  viewsCount: number;
  favoritesCount: number;
  hostId: string;
  currency: string;
  exchangeRate: number;
  imageUrl?: string;
}

export interface RentalContract {
  id: string;
  bookingId: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  contractNumber: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  totalAmount: number;
  currency: string;
  propertyAddress: string;
  propertyDetails: PropertyDetails;
  tenantDetails: TenantDetails;
  landlordDetails: LandlordDetails;
  terms: ContractTerms;
  status: ContractStatus;
  isDigitalSigned: boolean;
  tenantSignedAt?: string;
  landlordSignedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PropertyDetails {
  title: string;
  type: string;
  area: number;
  roomsCount: number;
  bathroomsCount: number;
  hasFurniture: boolean;
  hasParking: boolean;
  amenities: string[];
  description: string;
}

export interface TenantDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  passportNumber?: string;
  address: string;
  city: string;
  region: string;
}

export interface LandlordDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
}

export interface ContractTerms {
  paymentMethod: string;
  paymentDueDay: number;
  lateFeePercentage: number;
  maintenanceResponsibility: string;
  utilitiesIncluded: string[];
  houseRules: string[];
  terminationNoticeDays: number;
  earlyTerminationFee: number;
  petPolicy: string;
  smokingPolicy: string;
  guestPolicy: string;
}

export interface CreateRentalContractRequest {
  bookingId: string;
  monthlyRent: number;
  securityDeposit: number;
  currency: string;
  startDate: string;
  endDate: string;
  terms: Partial<ContractTerms>;
}

export interface UpdateRentalContractRequest {
  id: string;
  monthlyRent?: number;
  securityDeposit?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  terms?: Partial<ContractTerms>;
  status?: ContractStatus;
}

export enum ContractStatus {
  Draft = 'Draft',
  PendingSignature = 'PendingSignature',
  Active = 'Active',
  Expired = 'Expired',
  Terminated = 'Terminated'
}

export enum ContractType {
  Residential = 'Residential',
  Commercial = 'Commercial',
  Vacation = 'Vacation'
}

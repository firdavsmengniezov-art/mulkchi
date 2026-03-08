export enum ContractStatus { Draft = 0, Pending = 1, Active = 2, Expired = 3, Terminated = 4, Cancelled = 5 }

export interface RentalContract {
  id: string;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  terms: string;
  documentUrl?: string;
  isSigned: boolean;
  signedAt?: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  homeRequestId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}

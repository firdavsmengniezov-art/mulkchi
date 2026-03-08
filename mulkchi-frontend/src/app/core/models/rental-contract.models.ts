export type ContractStatus =
  | 'Draft'
  | 'Pending'
  | 'Active'
  | 'Expired'
  | 'Terminated'
  | 'Cancelled';

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

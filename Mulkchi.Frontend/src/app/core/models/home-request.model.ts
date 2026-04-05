import { PropertyType, ListingType } from './property.model';

export interface HomeRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  location: string;
  region: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  roomsCount?: number;
  listingType: ListingType;
  status: HomeRequestStatus;
  contactInfo: ContactInfo;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateHomeRequestRequest {
  title: string;
  description: string;
  propertyType: PropertyType;
  location: string;
  region: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  roomsCount?: number;
  listingType: ListingType;
  contactInfo: ContactInfo;
}

export interface UpdateHomeRequestRequest {
  id: string;
  title?: string;
  description?: string;
  propertyType?: PropertyType;
  location?: string;
  region?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  roomsCount?: number;
  listingType?: ListingType;
  status?: HomeRequestStatus;
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  preferredContactMethod: ContactMethod;
  additionalNotes?: string;
}

export enum HomeRequestStatus {
  Active = 'Active',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum ContactMethod {
  Phone = 'Phone',
  Email = 'Email',
  Both = 'Both'
}

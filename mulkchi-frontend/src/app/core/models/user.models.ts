export type Gender = 'Male' | 'Female' | 'Other';
export type UserRole = 'Guest' | 'Host' | 'Admin';
export type HostBadge = 'None' | 'SuperHost' | 'PremiumHost';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  gender: Gender;
  isVerified: boolean;
  role: UserRole;
  badge: HostBadge;
  rating: number;
  responseRate: number;
  responseTimeMinutes: number;
  totalListings: number;
  totalBookings: number;
  hostSince?: string;
  preferredLanguage?: string;
  createdDate: string;
  updatedDate: string;
}

export enum Gender { Male = 0, Female = 1, Other = 2, PreferNotToSay = 3 }
export enum UserRole { Guest = 0, Host = 1, Admin = 2 }
export enum HostBadge { None = 0, NewHost = 1, SuperHost = 2, PremiumHost = 3 }

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

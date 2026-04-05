import { UserRole } from './auth.model';

export { UserRole };

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  region?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginDate?: string;
  registrationDate: string;
  updatedDate?: string;
  propertiesCount?: number;
  bookingsCount?: number;
  totalRevenue?: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  region?: string;
}

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  status?: UserStatus;
  address?: string;
  city?: string;
  region?: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  adminsCount: number;
  hostsCount: number;
  regularUsersCount: number;
  newUsersThisMonth: number;
  usersByRegion: { region: string; count: number }[];
  usersByRole: { role: UserRole; count: number }[];
}

export enum UserStatus {
  Active = 'Active',
  Blocked = 'Blocked',
  Pending = 'Pending',
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: "Guest" | "Host" | "Admin";
  isVerified: boolean;
  createdDate: string;
  propertiesCount?: number;
  averageRating?: number;
  bio?: string;
  preferredLanguage?: 'uz' | 'ru' | 'en';
}

export interface UserUpdateDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  preferredLanguage?: "uz" | "ru" | "en";
}

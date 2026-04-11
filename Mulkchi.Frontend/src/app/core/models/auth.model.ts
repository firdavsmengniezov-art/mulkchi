export enum UserRole {
  Guest = 0,
  Host = 1,
  Admin = 2,
  Agent = 3,
  Seller = 4,
  Buyer = 5,
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  preferredLanguage?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}

/**
 * Shape returned by login / register / refresh endpoints.
 * `accessToken` is persisted in localStorage for HTTP auth and SignalR.
 */
export interface AuthUserInfo {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  expiresAt: string;
  /** Short-lived JWT used by HTTP requests and SignalR. */
  accessToken: string;
}

/** @deprecated Use AuthUserInfo. Kept for backward compatibility. */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

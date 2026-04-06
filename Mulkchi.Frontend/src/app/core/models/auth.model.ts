export enum UserRole { Guest = 0, Host = 1, Admin = 2 }

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
 * Tokens are delivered via httpOnly cookies — NOT in this payload.
 * `accessToken` is provided solely for SignalR's in-memory use.
 */
export interface AuthUserInfo {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  /** For SignalR only. Store in memory, never in localStorage/sessionStorage. */
  accessToken: string;
}

/** @deprecated Use AuthUserInfo. Kept for backward compatibility. */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}


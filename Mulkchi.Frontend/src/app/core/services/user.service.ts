import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserResponse,
  UserRole,
  UserStatistics,
  UserUpdateDto,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`).pipe(catchError(this.handleError));
  }

  updateProfile(dto: UserUpdateDto): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/me`, dto).pipe(catchError(this.handleError));
  }

  uploadAvatar(file: File): Observable<UserResponse> {
    const formData = new FormData();
    formData.append('avatarFile', file);
    return this.http
      .put<UserResponse>(`${this.apiUrl}/me/avatar`, formData)
      .pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // Admin operations
  getUsers(
    page = 1,
    pageSize = 10,
    role?: string,
    status?: string,
  ): Observable<{ items: User[]; totalCount: number; page: number; pageSize: number }> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (role) url += `&role=${role}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  updateUser(request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // User management actions
  updateUserRole(userId: string, role: UserRole | string): Observable<User> {
    return this.updateUser({
      id: userId,
      role: role as any,
    });
  }

  toggleUserStatus(userId: string, status: string): Observable<User> {
    return this.updateUser({
      id: userId,
      status: status as any,
    });
  }

  blockUser(userId: string): Observable<User> {
    return this.toggleUserStatus(userId, 'Blocked');
  }

  unblockUser(userId: string): Observable<User> {
    return this.toggleUserStatus(userId, 'Active');
  }

  // Search operations
  searchUsers(
    query: string,
    page = 1,
    pageSize = 10,
  ): Observable<{ items: User[]; totalCount: number; page: number; pageSize: number }> {
    return this.http
      .get<any>(
        `${this.apiUrl}/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
      )
      .pipe(catchError(this.handleError));
  }

  // Statistics
  getUserStatistics(): Observable<UserStatistics> {
    return this.http
      .get<UserStatistics>(`${this.apiUrl}/statistics`)
      .pipe(catchError(this.handleError));
  }

  // Current user operations

  // Utility methods
  getUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }

  getUserInitials(user: User): string {
    const firstName = user.firstName?.charAt(0) || '';
    const lastName = user.lastName?.charAt(0) || '';
    return (firstName + lastName).toUpperCase() || user.email.charAt(0).toUpperCase();
  }

  isUserActive(user: User): boolean {
    return user.status === 'Active';
  }

  isUserBlocked(user: User): boolean {
    return user.status === 'Blocked';
  }

  isUserAdmin(user: User): boolean {
    return user.role === UserRole.Admin;
  }

  isUserHost(user: User): boolean {
    return user.role === UserRole.Host;
  }

  isUserRegular(user: User): boolean {
    return user.role === UserRole.Guest;
  }

  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Host':
        return 'bg-blue-100 text-blue-800';
      case 'User':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uz-UZ');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('uz-UZ');
  }

  private handleError(error: any): Observable<never> {
    this.logger.error('UserService error:', error);
    let errorMessage = 'An error occurred with user operations';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (error.status === 404) {
      errorMessage = 'User not found';
    }

    return throwError(() => errorMessage);
  }
}

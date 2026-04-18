import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Unauthorized - token expired or invalid
        authService.logout();
        router.navigate(['/auth/login']);
      }
      
      if (error.status === 403) {
        // Forbidden - not enough permissions
        console.error('Access forbidden:', error.error?.message || 'You do not have permission to access this resource');
      }
      
      if (error.status === 500) {
        // Server error
        console.error('Server error:', error.error?.message || 'An unexpected error occurred');
      }
      
      return throwError(() => error);
    })
  );
};

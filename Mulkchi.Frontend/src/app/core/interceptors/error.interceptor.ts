import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Skip if already on logout endpoint to prevent infinite loop
        if (req.url.includes('/logout')) {
          authService.clearAuth();
          return throwError(() => error);
        }
        
        // Skip if this is an auth check endpoint - don't redirect on initial load
        if (req.url.includes('/auth/me')) {
          // Silently clear auth without redirect
          authService.clearAuth();
          return throwError(() => error);
        }
        
        // Unauthorized - token expired or invalid, redirect to login
        authService.clearAuth();
        router.navigate(['/auth/login']);
      }
      
      // Error handling is done via ErrorHandler service or toast notifications
      // 403: Forbidden - user doesn't have required permissions
      // 500: Server error - backend issue, already logged server-side
      
      return throwError(() => error);
    })
  );
};

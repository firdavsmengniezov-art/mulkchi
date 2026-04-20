import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get token from localStorage directly (most reliable)
  const token = localStorage.getItem('access_token');
  
  // Debug logging
  if (req.url.includes('/api/')) {
    console.log('[JWT Interceptor] URL:', req.url);
    console.log('[JWT Interceptor] Token exists:', !!token);
    console.log('[JWT Interceptor] Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
  }
  
  // Only add token to API requests
  if (req.url.startsWith(environment.apiUrl) && token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('[JWT Interceptor] Added Authorization header');
  }
  
  return next(req);
};

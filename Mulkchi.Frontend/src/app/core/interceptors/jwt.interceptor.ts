import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            req = req.clone({ setHeaders: { Authorization: `Bearer ${res.token}` } });
            return next(req);
          }),
          catchError(() => { 
            auth.logout(); 
            router.navigate(['/login']); 
            return throwError(() => err); 
          })
        );
      }
      return throwError(() => err);
    })
  );
};

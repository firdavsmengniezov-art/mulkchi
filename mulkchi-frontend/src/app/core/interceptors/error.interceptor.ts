import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        localStorage.removeItem('mulkchi_token');
        localStorage.removeItem('mulkchi_refresh_token');
        localStorage.removeItem('mulkchi_user_id');
        localStorage.removeItem('mulkchi_role');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        router.navigate(['/']);
      } else if (error.status >= 500) {
        console.error('Server error:', error);
      }
      return throwError(() => error);
    })
  );
};

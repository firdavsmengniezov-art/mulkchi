import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Module-level state for refresh coordination (shared across all interceptor calls)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Don't retry refresh-token requests to prevent infinite loops
      if (err.status === 401 && !req.url.includes('/auth/refresh-token') && !req.url.includes('/auth/login')) {
        return handle401Error(req, next, auth, router);
      }
      return throwError(() => err);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: (req: HttpRequest<unknown>) => Observable<any>,
  auth: AuthService,
  router: Router
): Observable<any> {
  if (isRefreshing) {
    // Another refresh is already in progress — wait for it to complete
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(req, token!)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return auth.refreshToken().pipe(
    switchMap(res => {
      isRefreshing = false;
      refreshTokenSubject.next(res.token);
      return next(addToken(req, res.token));
    }),
    catchError(refreshErr => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      auth.logout().subscribe();
      router.navigate(['/login']);
      return throwError(() => refreshErr);
    })
  );
}

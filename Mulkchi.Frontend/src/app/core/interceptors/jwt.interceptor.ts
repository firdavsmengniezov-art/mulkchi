import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Module-level guard so only one refresh attempt runs at a time
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<boolean>(false);

/**
 * Auth interceptor.
 *
 * - Adds a bearer token from localStorage to authenticated requests.
 * - Keeps `withCredentials: true` so refresh/logout still work with cookies.
 * - On 401, attempts a single refresh and retries with the new token.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const authorizedReq = addAuthorizationHeader(req, auth.getToken());

  return next(authorizedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (
        err.status === 401 &&
        !req.url.includes('/auth/refresh-token') &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/register') &&
        !req.url.includes('/auth/logout')
      ) {
        return handle401Error(req, next, auth, router);
      }
      return throwError(() => err);
    }),
  );
};

function addAuthorizationHeader(
  req: HttpRequest<unknown>,
  token: string | null,
): HttpRequest<unknown> {
  return req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router,
): Observable<any> {
  if (isRefreshing) {
    return refreshDone$.pipe(
      filter((done) => done),
      take(1),
      switchMap(() => next(addAuthorizationHeader(req, auth.getToken()))),
    );
  }

  isRefreshing = true;
  refreshDone$.next(false);

  return auth.refreshToken().pipe(
    switchMap(() => {
      isRefreshing = false;
      refreshDone$.next(true);
      return next(addAuthorizationHeader(req, auth.getToken()));
    }),
    catchError((refreshErr) => {
      isRefreshing = false;
      refreshDone$.next(false);
      auth.logout().subscribe();
      router.navigate(['/login']);
      return throwError(() => refreshErr);
    }),
  );
}

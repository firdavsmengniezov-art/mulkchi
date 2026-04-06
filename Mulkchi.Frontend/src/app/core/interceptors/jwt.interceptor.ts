import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Module-level guard so only one refresh attempt runs at a time
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<boolean>(false);

/**
 * Cookie-based auth interceptor.
 *
 * - Adds `withCredentials: true` to every request so the browser sends
 *   the httpOnly `access_token` cookie automatically.
 * - On 401 (expired cookie), attempts a silent token refresh once.
 * - Auth / refresh endpoints are excluded from the retry loop.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Ensure cookies are sent on every request
  const credentialsReq = req.clone({ withCredentials: true });

  return next(credentialsReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (
        err.status === 401 &&
        !req.url.includes('/auth/refresh-token') &&
        !req.url.includes('/auth/login')
      ) {
        return handle401Error(credentialsReq, next, auth, router);
      }
      return throwError(() => err);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router
): Observable<any> {
  if (isRefreshing) {
    return refreshDone$.pipe(
      filter(done => done),
      take(1),
      switchMap(() => next(req))
    );
  }

  isRefreshing = true;
  refreshDone$.next(false);

  return auth.refreshToken().pipe(
    switchMap(() => {
      isRefreshing = false;
      refreshDone$.next(true);
      return next(req);
    }),
    catchError(refreshErr => {
      isRefreshing = false;
      refreshDone$.next(false);
      auth.logout().subscribe();
      router.navigate(['/login']);
      return throwError(() => refreshErr);
    })
  );
}


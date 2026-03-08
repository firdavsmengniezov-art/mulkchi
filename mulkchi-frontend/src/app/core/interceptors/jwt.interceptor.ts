import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'mulkchi_token';
const SKIP_PATHS = ['/api/auth/login', '/api/auth/register'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const shouldSkip = SKIP_PATHS.some(path => req.url.includes(path));
  if (shouldSkip) {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};

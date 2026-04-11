import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles: string[] = route.data['roles'] || [];
  const rawRole = auth.getUserRole();
  const roleValue = rawRole as unknown;

  const normalizedRole =
    roleValue === 0 || roleValue === 'Guest'
      ? 'Guest'
      : roleValue === 1 || roleValue === 'Host'
        ? 'Host'
        : roleValue === 2 || roleValue === 'Admin'
          ? 'Admin'
          : null;

  if (normalizedRole && roles.includes(normalizedRole)) {
    return true;
  }

  return router.createUrlTree(['/']);
};

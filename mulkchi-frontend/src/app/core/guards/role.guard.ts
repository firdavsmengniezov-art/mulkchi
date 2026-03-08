import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole: string = route.data['role'];
  const userRole = authService.getRole();

  if (userRole === requiredRole) {
    return true;
  }

  return router.createUrlTree(['/']);
};

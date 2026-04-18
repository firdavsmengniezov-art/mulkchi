import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const hostGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const currentUser = authService.currentUser();
  
  if (currentUser && (currentUser.role === UserRole.Host || currentUser.role === UserRole.Admin || currentUser.role === UserRole.SuperAdmin)) {
    return true;
  }
  
  router.navigate(['/']);
  return false;
};

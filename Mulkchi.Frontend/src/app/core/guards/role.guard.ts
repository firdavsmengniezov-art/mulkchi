import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles: string[] = route.data['roles'] || [];
  const role = auth.getUserRole();
  const roleMap: any = { 0: 'Guest', 1: 'Host', 2: 'Admin' };
  
  if (role !== null && roles.includes(roleMap[role])) return true;
  router.navigate(['/']);
  return false;
};

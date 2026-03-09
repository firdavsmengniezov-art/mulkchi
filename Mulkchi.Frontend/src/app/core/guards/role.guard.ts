import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRoles = route.data['roles'] as UserRole[];
    const currentUser = this.authService.currentUser;
    
    if (currentUser && allowedRoles.includes(currentUser.role)) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}

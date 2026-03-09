import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/interfaces/auth.interface';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  
  // Protected routes
  { path: 'property/:id', loadComponent: () => import('./pages/property-detail/property-detail.component').then(m => m.PropertyDetailComponent) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent), canActivate: [AuthGuard] },
  { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent), canActivate: [AuthGuard] },
  { path: 'ai-predictor', loadComponent: () => import('./pages/ai-predictor/ai-predictor.component').then(m => m.AiPredictorComponent) },
  
  // Host routes
  { 
    path: 'host-dashboard', 
    loadComponent: () => import('./pages/host-dashboard/host-dashboard.component').then(m => m.HostDashboardComponent), 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Host, UserRole.Admin] }
  },
  
  // Admin routes
  { 
    path: 'admin-panel', 
    loadComponent: () => import('./pages/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent), 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin] }
  },
  
  // Fallback
  { path: '**', redirectTo: '/home' }
];

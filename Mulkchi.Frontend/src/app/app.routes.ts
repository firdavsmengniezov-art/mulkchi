import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'properties', loadComponent: () => import('./features/properties/property-list/property-list.component').then(m => m.PropertyListComponent) },
  { path: 'properties/:id', loadComponent: () => import('./features/properties/property-detail/property-detail.component').then(m => m.PropertyDetailComponent) },
  { 
    path: 'dashboard', 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['Host','Admin'] }, 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'chat', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/chat/chat/chat.component').then(m => m.ChatComponent) 
  },
  { 
    path: 'chat/:userId', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/chat/chat/chat.component').then(m => m.ChatComponent) 
  },
  { path: 'ai-price', loadComponent: () => import('./features/ai-price/ai-price.component').then(m => m.AiPriceComponent) },
  { 
    path: 'notifications', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/notifications/notifications-page/notifications-page.component').then(m => m.NotificationsPageComponent) 
  },
  { 
    path: 'favorites', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/favorites/favorites-page/favorites-page.component').then(m => m.FavoritesPageComponent) 
  },
  { 
    path: 'profile', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) 
  },
  { path: '**', redirectTo: '' }
];

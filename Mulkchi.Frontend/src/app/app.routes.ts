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
    path: 'payments', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/payments/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent) 
  },
  { 
    path: 'favorites', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/favorites/favorites-page/favorites-page.component').then(m => m.FavoritesPageComponent) 
  },
  { 
    path: 'reviews', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/reviews/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent) 
  },
  { 
    path: 'my-bookings', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/bookings/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) 
  },
  { 
    path: 'host-bookings', 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['Host','Admin'] }, 
    loadComponent: () => import('./features/bookings/host-bookings/host-bookings.component').then(m => m.HostBookingsComponent) 
  },
  { 
    path: 'saved-searches', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/saved-searches/saved-search-list/saved-search-list.component').then(m => m.SavedSearchListComponent) 
  },
  { 
    path: 'saved-searches/new', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/saved-searches/saved-search-form/saved-search-form.component').then(m => m.SavedSearchFormComponent) 
  },
  { 
    path: 'saved-searches/:id/edit', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/saved-searches/saved-search-form/saved-search-form.component').then(m => m.SavedSearchFormComponent) 
  },
  { 
    path: 'profile', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) 
  },
  { path: '**', redirectTo: '' }
];

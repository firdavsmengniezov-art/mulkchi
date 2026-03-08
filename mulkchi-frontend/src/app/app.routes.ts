import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { PropertyListComponent } from './pages/properties/property-list/property-list.component';
import { PropertyDetailComponent } from './pages/properties/property-detail/property-detail.component';
import { DashboardLayoutComponent } from './pages/dashboard/layout/dashboard-layout.component';
import { DashboardOverviewComponent } from './pages/dashboard/overview/dashboard-overview.component';
import { MyPropertiesComponent } from './pages/dashboard/my-properties/my-properties.component';
import { RequestsComponent } from './pages/dashboard/requests/requests.component';
import { PaymentsComponent } from './pages/dashboard/payments/payments.component';
import { SettingsComponent } from './pages/dashboard/settings/settings.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'properties', component: PropertyListComponent },
  { path: 'properties/:id', component: PropertyDetailComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DashboardOverviewComponent },
      { path: 'my-properties', component: MyPropertiesComponent },
      { path: 'requests', component: RequestsComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
  { path: '**', component: NotFoundComponent },
];

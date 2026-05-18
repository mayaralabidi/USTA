import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';
import { RegisterComponent } from './features/register';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => Promise.resolve(RegisterComponent),
  },
  {
    path: 'setup-admin',
    loadComponent: () =>
      import('./features/setup-admin/setup-admin.component').then((m) => m.SetupAdminComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'equipements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/equipements/equipements.component').then((m) => m.EquipementsComponent),
  },
  {
    path: 'pannes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pannes/pannes.component').then((m) => m.PannesComponent),
  },
  {
    path: 'techniciens',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/techniciens/techniciens.component').then((m) => m.TechniciensComponent),
  },
  {
    path: 'interventions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/interventions/interventions.component').then(
        (m) => m.InterventionsComponent,
      ),
  },
  {
    path: 'statistiques',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/statistiques/statistiques.component').then((m) => m.StatistiquesComponent),
  },
  {
    path: 'administration',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin-users/admin-users.component').then((m) => m.AdminUsersComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];

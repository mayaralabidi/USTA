import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'equipements',
    loadComponent: () =>
      import('./features/equipements/equipements.component').then((m) => m.EquipementsComponent),
  },
  {
    path: 'pannes',
    loadComponent: () =>
      import('./features/pannes/pannes.component').then((m) => m.PannesComponent),
  },
  {
    path: 'techniciens',
    loadComponent: () =>
      import('./features/techniciens/techniciens.component').then((m) => m.TechniciensComponent),
  },
  {
    path: 'interventions',
    loadComponent: () =>
      import('./features/interventions/interventions.component').then(
        (m) => m.InterventionsComponent,
      ),
  },
  {
    path: 'statistiques',
    loadComponent: () =>
      import('./features/statistiques/statistiques.component').then((m) => m.StatistiquesComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];

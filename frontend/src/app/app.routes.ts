import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const appRoutes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'workspaces',
        loadChildren: () =>
          import('./features/workspace/workspace.routes').then(m => m.WORKSPACE_ROUTES)
      },
      {
        path: 'boards',
        loadChildren: () =>
          import('./features/boards/boards.routes').then(m => m.BOARD_ROUTES)
      },
      {
        path: 'w/:workspaceId/boards',
        loadChildren: () =>
          import('./features/boards/boards.routes').then(m => m.BOARD_ROUTES)
      },
      {
        path: 'activity',
        loadChildren: () =>
          import('./features/activity/activity.routes').then(m => m.ACTIVITY_ROUTES)
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

import { Routes } from '@angular/router';
import { WorkspaceListPageComponent } from './pages/workspace-list-page/workspace-list-page.component';

export const WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    component: WorkspaceListPageComponent
  },
  {
    path: ':workspaceId/:workspaceSlug',
    component: WorkspaceListPageComponent
  }
];
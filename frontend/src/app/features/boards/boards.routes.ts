import { Routes } from '@angular/router';
import { BoardDetailPageComponent } from './pages/board-detail-page/board-detail-page.component';
import { BoardsPageComponent } from './pages/boards-page/boards-page.component';

export const BOARD_ROUTES: Routes = [
  {
    path: '',
    component: BoardsPageComponent
  },
  {
    path: 'w/:workspaceId',
    component: BoardsPageComponent
  },
  {
    path: ':boardId/:boardSlug',
    component: BoardDetailPageComponent
  },
  {
    path: ':boardId',
    component: BoardDetailPageComponent
  }
];
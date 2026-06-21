import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { ColumnDropEventPayload, TaskDropEventPayload } from '../models/drag-drop.model';
import { BoardStoreService } from './board-store.service';
import { TaskStoreService } from '../../task/data-access/task-store.service';

@Injectable({ providedIn: 'root' })
export class KanbanDndFacade {
  private readonly boardStore = inject(BoardStoreService);
  private readonly taskStore = inject(TaskStoreService);
  private readonly notificationService = inject(NotificationService);

  handleColumnDrop(event: ColumnDropEventPayload): void {
    this.boardStore.handleColumnDrop(event);
  }

  handleTaskDrop(event: TaskDropEventPayload): void {
    const boardId = this.boardStore.currentBoardId;
    if (!boardId) {
      this.notificationService.error('Board not loaded');
      return;
    }

    this.taskStore.handleTaskDrop(boardId, event);
  }
}

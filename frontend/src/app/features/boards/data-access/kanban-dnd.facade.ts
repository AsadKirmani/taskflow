import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { ColumnDropEventPayload, TaskDropEventPayload } from '../models/drag-drop.model';
import { BoardStore } from './board-store.service';
import { TaskStore } from '../../task/data-access/task-store.service';

@Injectable({ providedIn: 'root' })
export class KanbanDndFacade {
  private readonly boardStore = inject(BoardStore);
  private readonly taskStore = inject(TaskStore);
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

    this.taskStore.handleTaskDrop(boardId()!, event);
  }
}

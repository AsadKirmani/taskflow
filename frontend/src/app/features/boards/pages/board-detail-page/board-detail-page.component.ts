import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardStoreService } from '../../data-access/board-store.service';
import { TaskStoreService } from '../../data-access/task-store.service';
import { KanbanDndFacade } from '../../data-access/kanban-dnd.facade';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { 
  TaskDropEventPayload, 
  ColumnDropEventPayload, 
  AddTaskEventPayload, 
  AddColumnEventPayload, 
  UpdateTaskEventPayload, 
  ToggleTaskCompletionEventPayload 
} from '../../models/drag-drop.model';

@Component({
  selector: 'app-board-detail-page',
  standalone: true,
  imports: [KanbanBoardComponent],
  template: `
    <app-kanban-board
      class="block h-full min-h-0"
      [board]="currentBoard()"
      [columns]="currentColumns()"
      [tasksByColumn]="tasksByColumn()"
      [loading]="isLoading()"
      (taskMoved)="onTaskMoved($event)"
      (columnMoved)="onColumnMoved($event)"
      (taskAdded)="onTaskAdded($event)"
      (columnAdded)="onColumnAdded($event)"
      (taskUpdated)="onTaskUpdated($event)"
      (taskCompletionToggled)="onTaskCompletionToggled($event)"
    />
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly boardStore = inject(BoardStoreService);
  protected readonly taskStore = inject(TaskStoreService);
  private readonly dndFacade = inject(KanbanDndFacade);

  activeBoardId = signal<string | null>(null);

  currentBoard = computed(() => this.boardStore.currentBoard);
  currentColumns = computed(() => {
    return this.boardStore.currentColumns;
  });
  
  isLoading = computed(() => {
  const currentStoreState = (this.boardStore as any).stateSubject?.getValue();
  const currentTaskState = (this.taskStore as any).stateSubject?.getValue();
  return (currentStoreState?.loading || currentTaskState?.loading) ?? false;
});

  tasksByColumn = computed(() => {
    const cols = this.currentColumns();
    if (!cols || cols.length === 0) return {};
    return this.taskStore.buildTasksByColumn(cols);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const boardId = params.get('boardId');
      this.activeBoardId.set(boardId);
      if (boardId) {
        this.boardStore.loadBoard(boardId);
        this.boardStore.loadBoardColumns(boardId);
        this.taskStore.getTasksInBoard(boardId);
      }
    });
  }

  onTaskMoved(event: TaskDropEventPayload): void {
    this.dndFacade.handleTaskDrop(event);
  }

  onColumnMoved(event: ColumnDropEventPayload): void {
    this.dndFacade.handleColumnDrop(event);
  }

  onTaskAdded(event: AddTaskEventPayload): void {
    const board = this.currentBoard();
    if (!board?.id) return;

    this.taskStore.addTask(board.id, event.columnId, event.title, board.workspaceId);
  }

  onColumnAdded(event: AddColumnEventPayload): void {
    const board = this.currentBoard();
    if (!board?.id) return;

    this.boardStore.createColumn(board.id, board.workspaceId, event.title);
  }

  onTaskUpdated(event: UpdateTaskEventPayload): void {
    const board = this.currentBoard();
    if (!board?.id) return;

    this.taskStore.updateTask(board.id, event.taskId, { title: event.title });
  }

  onTaskCompletionToggled(event: ToggleTaskCompletionEventPayload): void {
    const board = this.currentBoard();
    if (!board?.id) return;

    this.taskStore.toggleTaskCompletion(board.id, event.taskId, event.isCompleted);
  }
}
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  computed,
  signal,
  effect,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardStore } from '../../data-access/board-store.service';
import { TaskStore } from '../../../task/data-access/task-store.service';
import { KanbanDndFacade } from '../../data-access/kanban-dnd.facade';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { distinctUntilChanged, map } from 'rxjs';
import {
  TaskDropEventPayload,
  ColumnDropEventPayload,
  AddTaskEventPayload,
  AddColumnEventPayload,
  UpdateTaskEventPayload,
  ToggleTaskCompletionEventPayload,
} from '../../models/drag-drop.model';
import { TaskFacade } from '../../../task/facades/task.facade';

@Component({
  selector: 'app-board-detail-page',
  standalone: true,
  imports: [KanbanBoardComponent],
  template: `
    <app-kanban-board
      class="block h-full min-h-0"
      [board]="boardStore.currentBoard()"
      [columns]="boardStore.currentColumns()"
      [tasksByColumn]="taskStore.buildTasksByColumn(boardStore.currentColumns())"
      [loading]="isLoading()"
      (taskMoved)="onTaskMoved($event)"
      (columnMoved)="onColumnMoved($event)"
      (taskAdded)="onTaskAdded($event)"
      (columnAdded)="onColumnAdded($event)"
      (taskUpdated)="onTaskUpdated($event)"
      (taskCompletionToggled)="onTaskCompletionToggled($event)"
      (columnArchived)="onColumnArchived($event)"
      [boardMembers]="boardStore.members()"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly boardStore = inject(BoardStore);
  protected readonly taskStore = inject(TaskStore);
  protected readonly facade = inject(TaskFacade);
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
    return this.taskStore.buildTasksByColumn(cols());
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('boardId')),
        distinctUntilChanged(),
      )
      .subscribe((boardId) => {
        this.activeBoardId.set(boardId);
        if (boardId) {
          this.boardStore.loadBoard(boardId);
          this.taskStore.getTasksInBoard(boardId, this.boardStore.currentColumns(), true);
        }
      });
  }
  ngOnDestroy(): void {
    this.boardStore.resetBoardState();
  }
  onTaskMoved(event: TaskDropEventPayload): void {
    this.dndFacade.handleTaskDrop(event);
  }

  onColumnMoved(event: ColumnDropEventPayload): void {
    this.dndFacade.handleColumnDrop(event);
  }

  onTaskAdded(event: AddTaskEventPayload): void {
    const board = this.currentBoard();
    if (!board()?.id) return;

    this.taskStore.addTask(board()!.id, event.columnId, event.title, board()!.workspaceId);
  }

  onColumnAdded(event: AddColumnEventPayload): void {
    const board = this.currentBoard();
    if (!board()?.id) return;

    this.boardStore.createColumn(board()!.id, board()!.workspaceId, event.title);
  }

  onTaskUpdated(event: UpdateTaskEventPayload): void {
    const board = this.currentBoard();
    if (!board()?.id) return;

    this.taskStore.updateTask(event.taskId, { title: event.title });
  }

  onTaskCompletionToggled(event: ToggleTaskCompletionEventPayload): void {
    const board = this.currentBoard();
    if (!board()?.id) return;

    this.taskStore.toggleTaskCompletion(event.taskId, event.isCompleted);
  }
  onColumnArchived(event: { columnId: string; columnName: string }) {
    const board = this.currentBoard();
    if (!board()?.id) return;
    this.boardStore.archiveColumn(
      event.columnId,
      board()!.workspaceId,
      event.columnName,
      'Archived from column menu',
    );
  }
}

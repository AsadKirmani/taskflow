import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoardStoreService } from '../../data-access/board-store.service';
import { TaskStoreService } from '../../data-access/task-store.service';
import { KanbanDndFacade } from '../../data-access/kanban-dnd.facade';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { TaskDropEventPayload, ColumnDropEventPayload, AddTaskEventPayload, UpdateTaskEventPayload, ToggleTaskCompletionEventPayload } from '../../models/drag-drop.model';

@Component({
  selector: 'app-board-detail-page',
  standalone: true,
  imports: [AsyncPipe, KanbanBoardComponent],
  template: `
    @if (vm$ | async; as vm) {
      <app-kanban-board
        [board]="vm.board"
        [columns]="vm.columns"
        [tasksByColumn]="vm.tasksByColumn"
        [loading]="vm.loading"
        (taskMoved)="onTaskMoved($event)"
        (columnMoved)="onColumnMoved($event)"
        (taskAdded)="onTaskAdded($event)"
        (taskUpdated)="onTaskUpdated($event)"
        (taskCompletionToggled)="onTaskCompletionToggled($event)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly boardStore = inject(BoardStoreService);
  private readonly taskStore = inject(TaskStoreService);
  private readonly dndFacade = inject(KanbanDndFacade);

  readonly vm$ = combineLatest([this.boardStore.vm$, this.taskStore.state$]).pipe(
    map(([boardVm, taskState]) => ({
      ...boardVm,
      tasksByColumn: this.taskStore.buildTasksByColumn(boardVm.columns),
      loading: boardVm.loading || taskState.loading
    }))
  );

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => params.get('boardId')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(boardId => {
        if (boardId) {
          this.boardStore.loadBoard(boardId);
          this.boardStore.getBoardColumns(boardId);
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
    const board = this.boardStore.currentBoard;
    if (!board) {
      return;
    }

    this.taskStore.addTask(board.id, event.columnId, event.title, board.workspaceId);
  }

  onTaskUpdated(event: UpdateTaskEventPayload): void {
    const board = this.boardStore.currentBoard;
    if (!board) {
      return;
    }

    this.taskStore.updateTask(board.id, event.taskId, { title: event.title });
  }

  onTaskCompletionToggled(event: ToggleTaskCompletionEventPayload): void {
    const board = this.boardStore.currentBoard;
    if (!board) {
      return;
    }

    this.taskStore.toggleTaskCompletion(board.id, event.taskId, event.isCompleted);
  }
}
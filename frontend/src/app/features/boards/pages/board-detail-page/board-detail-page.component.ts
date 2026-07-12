import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  computed,
  signal,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
      [tasksByColumn]="tasksByColumn()" 
      [loading]="isLoading()"
      (taskMoved)="onTaskMoved($event)"
      (columnMoved)="onColumnMoved($event)"
      (taskAdded)="onTaskAdded($event)"
      (columnAdded)="onColumnAdded($event)"
      (taskUpdated)="onTaskUpdated($event)"
      (taskCompletionToggled)="onTaskCompletionToggled($event)"
      (columnArchived)="onColumnArchived($event)"
      [boardMembers]="boardStore.members()"
      (visibilityToggled)="toggleVisibility()"
      (closeBoard)="closeBoard()"
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
export class BoardDetailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly boardStore = inject(BoardStore);
  protected readonly taskStore = inject(TaskStore);
  protected readonly facade = inject(TaskFacade);
  private readonly dndFacade = inject(KanbanDndFacade);
  private readonly router = inject(Router);

  activeBoardId = signal<string | null>(null);

  isLoading = computed(() => {
    return this.boardStore.loading() || this.taskStore.loading();
  });

  tasksByColumn = computed(() => {
    const cols = this.boardStore.currentColumns();
    if (!cols || cols.length === 0) return {};
    return this.taskStore.buildTasksByColumn(cols);
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
    const board = this.boardStore.currentBoard();
    if (!board?.id) return;

    this.taskStore.addTask(board.id, event.columnId, event.title, board.workspaceId);
  }

  onColumnAdded(event: AddColumnEventPayload): void {
    const board = this.boardStore.currentBoard();
    if (!board?.id) return;

    this.boardStore.createColumn(board.id, board.workspaceId, event.title);
  }

  onTaskUpdated(event: UpdateTaskEventPayload): void {
    const board = this.boardStore.currentBoard();
    if (!board?.id) return;

    this.taskStore.updateTask(event.taskId, { title: event.title });
  }

  onTaskCompletionToggled(event: ToggleTaskCompletionEventPayload): void {
    const board = this.boardStore.currentBoard();
    if (!board?.id) return;

    this.taskStore.toggleTaskCompletion(event.taskId, event.isCompleted);
  }

  onColumnArchived(event: { columnId: string; columnName: string }) {
    const board = this.boardStore.currentBoard();
    if (!board?.id) return;
    
    this.boardStore.archiveColumn(
      event.columnId,
      board.workspaceId,
      event.columnName,
      'Archived from column menu',
    );
  }

  toggleVisibility() {
    const board = this.boardStore.currentBoard();
    if (!board?.id) return;
    const newVisibility = board.visibility === 'private' ? 'workspace' : 'private';
    this.boardStore.changeBoardVisibility(board.id, newVisibility);
  }

  closeBoard() {
    const board = this.boardStore.currentBoard();
    if (!board?.id) return;
    this.boardStore.archiveBoard(board.id, board.workspaceId, 'Archived from board menu');
    this.router.navigate(['/boards']);
  }
}
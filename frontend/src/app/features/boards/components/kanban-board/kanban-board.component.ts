import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  DestroyRef,
  inject
} from '@angular/core';
import {
  CdkDrag,
  CdkDropList,
  CdkDragDrop,
  CdkDragHandle,
  DragStartDelay,
} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { Board } from '../../../../core/models/board.model';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { 
  TaskDropEventPayload, 
  ColumnDropEventPayload, 
  AddTaskEventPayload, 
  AddColumnEventPayload, 
  UpdateTaskEventPayload, 
  ToggleTaskCompletionEventPayload 
} from '../../models/drag-drop.model';
import { CommonModule } from '@angular/common';
import { TaskStoreService } from '../../data-access/task-store.service';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplyFilterComponent } from '../filters/filter.component';
import type { BoardFilterSelection } from '../filters/filter-selection.model';
import { TaskOverlayComponent } from '../task-overlay/task-overlay.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, ApplyFilterComponent, MatIconModule, CommonModule, TaskOverlayComponent],
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanBoardComponent {
  private readonly taskStore = inject(TaskStoreService);
  protected readonly authStore = inject(AuthStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @Input() board: Board | null = null;
  @Input() columns: BoardColumn[] = [];
  @Input() tasksByColumn: Record<string, Task[] | undefined> = {};
  @Input() loading = false;
  
  activeTaskInputColumnId: string | null = null;
  taskInputValues: Record<string, string | undefined> = {};
  activeTaskOverlayId: string | null = null;
  isColumnInputOpen = false;
  columnInputValue = '';
  
  @Output() taskMoved = new EventEmitter<TaskDropEventPayload>();
  @Output() columnMoved = new EventEmitter<ColumnDropEventPayload>();
  @Output() taskAdded = new EventEmitter<AddTaskEventPayload>();
  @Output() columnAdded = new EventEmitter<AddColumnEventPayload>();
  @Output() taskUpdated = new EventEmitter<UpdateTaskEventPayload>();
  @Output() taskCompletionToggled = new EventEmitter<ToggleTaskCompletionEventPayload>();
  
  activeEditTaskId: string | null = null;
  editTaskTitle = '';
  readonly dragStartDelay: DragStartDelay = { touch: 220, mouse: 200 };
  
  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.activeTaskOverlayId = params.get('taskId');
      });
  }
  
  isFilterOpen = false;
  toggleFilterView(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isFilterOpen = !this.isFilterOpen;
  }
  closeFilterView(): void {
    this.isFilterOpen = false;
  }

  get connectedDropListIds(): string[] {
    return this.columns.map(column => column.id);
  }

  onColumnDrop(event: CdkDragDrop<BoardColumn[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.columnMoved.emit({
      fromIndex: event.previousIndex,
      toIndex: event.currentIndex
    });
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumnId: string): void {
    const task = event.item.data as Task;
    const sourceColumnId = event.previousContainer.id;

    this.taskMoved.emit({
      taskId: task.id,
      sourceColumnId,
      targetColumnId,
      sourceIndex: event.previousIndex,
      targetIndex: event.currentIndex
    });
  }

  isTaskInputOpen(columnId: string): boolean {
    return this.activeTaskInputColumnId === columnId;
  }

  openTaskInput(columnId: string): void {
    this.activeTaskInputColumnId = columnId;
  }

  closeTaskInput(columnId: string): void {
    if (this.activeTaskInputColumnId === columnId) {
      this.activeTaskInputColumnId = null;
    }
  }

  onTaskInputChange(columnId: string, value: string): void {
    this.taskInputValues = {
      ...this.taskInputValues,
      [columnId]: value
    };
  }

  submitTaskInput(columnId: string): void {
    const title = (this.taskInputValues[columnId] ?? '').trim();
    if (!title) {
      this.closeTaskInput(columnId);
      return;
    }

    this.taskAdded.emit({ columnId, title });

    this.taskInputValues = {
      ...this.taskInputValues,
      [columnId]: ''
    };
    this.closeTaskInput(columnId);
  }

  openColumnInput(): void {
    this.isColumnInputOpen = true;
  }

  closeColumnInput(): void {
    this.isColumnInputOpen = false;
    this.columnInputValue = '';
  }

  onColumnInputChange(value: string): void {
    this.columnInputValue = value;
  }

  submitColumnInput(): void {
    const title = this.columnInputValue.trim();
    if (!title) {
      this.closeColumnInput();
      return;
    }

    this.columnAdded.emit({ title });
    this.closeColumnInput();
  }

  startTaskEdit(task: Task, event?: MouseEvent): void {
    event?.stopPropagation();
    this.activeEditTaskId = task.id;
    this.editTaskTitle = task.title;
  }

  cancelTaskEdit(): void {
    this.activeEditTaskId = null;
    this.editTaskTitle = '';
  }

  onEditTaskTitleChange(value: string): void {
    this.editTaskTitle = value;
  }

  toggleTaskCompletion(task: Task, event?: MouseEvent): void {
    event?.stopPropagation();
    this.taskCompletionToggled.emit({
      taskId: task.id,
      isCompleted: !task.isCompleted
    });
  }

  submitTaskEdit(task: Task): void {
    const title = this.editTaskTitle.trim();
    if (!title || title === task.title) {
      this.cancelTaskEdit();
      return;
    }

    this.taskUpdated.emit({ taskId: task.id, title });
    this.cancelTaskEdit();
  }

  openTaskOverlay(task: Task, event?: MouseEvent): void {
    event?.stopPropagation();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { taskId: task.id, taskTitle: this.toSlug(task.title) },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  closeTaskOverlay(event?: MouseEvent): void {
    event?.stopPropagation();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { taskId: null, taskTitle: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  get activeTaskOverlay(): Task | null {
    if (!this.activeTaskOverlayId) {
      return null;
    }

    for (const tasks of Object.values(this.tasksByColumn)) {
      const match = tasks?.find(task => task.id === this.activeTaskOverlayId);
      if (match) {
        return match;
      }
    }

    return null;
  }

  archiveColumn(columnId: string): void {
    // we can implement this later when we have the archived property in our column model and API support for it
  }

  onFiltersChanged(selection: BoardFilterSelection): void {
    const memberScope = selection.noMembers
      ? 'no_members'
      : selection.me
        ? 'me'
        : 'all';

    const completion = selection.completed && selection.incomplete
      ? 'all'
      : selection.completed
        ? 'completed'
        : selection.incomplete
          ? 'incomplete'
          : 'all';

    const currentUserId = this.authStore.currentUser()?.id ?? null;

    this.taskStore.updateFilters({
      currentUserId,
      memberScope,
      completion,
      dueType: selection.dueDate,
      labels: selection.labels,
      activity: selection.activity
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        memberScope: memberScope === 'all' ? null : memberScope,
        completion: completion === 'all' ? null : completion,
        dueType: selection.dueDate === 'all' ? null : selection.dueDate,
        labels: selection.labels.length ? selection.labels.join(',') : null,
        activity: selection.activity.length ? selection.activity.join(',') : null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'task';
  }
}
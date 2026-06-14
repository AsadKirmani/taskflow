import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, effect } from '@angular/core';
import { Board } from '../../../../core/models/board.model';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { TaskDropEventPayload, ColumnDropEventPayload, AddTaskEventPayload, AddColumnEventPayload, UpdateTaskEventPayload, ToggleTaskCompletionEventPayload } from '../../models/drag-drop.model';
import { CommonModule } from '@angular/common';
import { TaskStoreService } from '../../data-access/task-store.service';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplyFilterComponent } from '../filters/filter.component';
import type { BoardFilterSelection } from '../filters/filter-selection.model';
import { TaskOverlayComponent } from '../task-overlay/task-overlay.component';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { MatIconModule } from '@angular/material/icon';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [ApplyFilterComponent, CommonModule, TaskOverlayComponent, KanbanColumnComponent, MatIconModule, AutofocusDirective],
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanBoardComponent {
  private readonly taskStore = inject(TaskStoreService);
  protected readonly authStore = inject(AuthStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  board = input<Board | null>(null);
  columns = input<BoardColumn[]>([]);
  tasksByColumn = input<Record<string, Task[] | undefined>>({});
  loading = input<boolean>(false);
  
  taskMoved = output<TaskDropEventPayload>();
  columnMoved = output<ColumnDropEventPayload>();
  taskAdded = output<AddTaskEventPayload>();
  columnAdded = output<AddColumnEventPayload>();
  taskUpdated = output<UpdateTaskEventPayload>();
  taskCompletionToggled = output<ToggleTaskCompletionEventPayload>();
  
  activeTaskOverlayId: string | null = null;
  isColumnInputOpen = false;
  columnInputValue = '';
  isFilterOpen = false;
  hasActiveFilters = false;

  constructor() {
    
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.activeTaskOverlayId = params.get('taskId');
      });
  }

  toggleFilterView(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isFilterOpen = !this.isFilterOpen;
  }

  onColumnDropNative(payload: ColumnDropEventPayload): void {
    const { fromIndex, toIndex } = payload;
    if (fromIndex === toIndex) return;
    this.columnMoved.emit(payload);
  }

  onTaskDropNative(payload: TaskDropEventPayload): void {
    const { sourceColumnId, targetColumnId, sourceIndex, targetIndex } = payload;
    if (sourceColumnId === targetColumnId && sourceIndex === targetIndex) return;

    const currentTasks = this.tasksByColumn();
    const sourceTasks = [...(currentTasks[sourceColumnId] || [])];
    const targetTasks = sourceColumnId === targetColumnId ? sourceTasks : [...(currentTasks[targetColumnId] || [])];

    const [movedTask] = sourceTasks.splice(sourceIndex, 1);
    let insertIndex = targetIndex;
    if (sourceColumnId === targetColumnId && sourceIndex < targetIndex) {
      insertIndex--;
    }
    targetTasks.splice(insertIndex, 0, movedTask);

    this.taskMoved.emit(payload);
  }

  submitTaskInput(columnId: string, title: string): void {
    this.taskAdded.emit({ columnId, title });
  }

  openColumnInput(): void { this.isColumnInputOpen = true; }
  
  closeColumnInput(): void {
    this.isColumnInputOpen = false;
    this.columnInputValue = '';
  }

  onColumnInputChange(event: Event): void {
    this.columnInputValue = (event.target as HTMLInputElement).value;
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

  openTaskOverlay(task: Task): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { taskId: task.id, taskTitle: this.toSlug(task.title) },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  closeTaskOverlay(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { taskId: null, taskTitle: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  get activeTaskOverlay(): Task | null {
    if (!this.activeTaskOverlayId) return null;
    const tasksRecord = this.tasksByColumn();
    for (const tasks of Object.values(tasksRecord)) {
      const match = tasks?.find((task: Task) => task.id === this.activeTaskOverlayId);
      if (match) return match;
    }
    return null;
  }

  onFiltersChanged(selection: BoardFilterSelection): void {
    this.hasActiveFilters = 
      selection.noMembers || 
      selection.me || 
      selection.completed || 
      selection.incomplete || 
      selection.dueDate !== 'all' || 
      selection.labels.length > 0 || 
      selection.activity.length > 0;

    const memberScope = selection.noMembers ? 'no_members' : selection.me ? 'me' : 'all';
    const completion = selection.completed && selection.incomplete ? 'all' : selection.completed ? 'completed' : selection.incomplete ? 'incomplete' : 'all';
    const currentUserId = this.authStore.currentUser()?.id ?? null;

    this.taskStore.updateFilters({
      currentUserId, memberScope, completion,
      dueType: selection.dueDate, labels: selection.labels, activity: selection.activity
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
      queryParamsHandling: 'merge', replaceUrl: true
    });
  }

  private toSlug(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'task';
  }
}
import { ChangeDetectionStrategy, Component, inject, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

import { Board } from '../../../../core/models/board.model';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { TaskDropEventPayload, ColumnDropEventPayload, AddTaskEventPayload, AddColumnEventPayload, UpdateTaskEventPayload, ToggleTaskCompletionEventPayload } from '../../models/drag-drop.model';
import { TaskStore } from '../../../task/data-access/task-store.service';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { ApplyFilterComponent } from '../filters/filter.component';
import type { BoardFilterSelection } from '../filters/filter-selection.model';
import { TaskComponent } from '../../../task/task.component';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { AvatarComponent } from '../../../../shared/components/avatar.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [ApplyFilterComponent, CommonModule, TaskComponent, KanbanColumnComponent, MatIconModule, AutofocusDirective, AvatarComponent],
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanBoardComponent {
  private readonly taskStore = inject(TaskStore);
  protected readonly authStore = inject(AuthStoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Inputs ---
  board = input<Board | null>(null);
  columns = input<BoardColumn[]>([]);
  tasksByColumn = input<Record<string, Task[] | undefined>>({});
  loading = input<boolean>(false);
  
  // --- Outputs ---
  taskMoved = output<TaskDropEventPayload>();
  columnMoved = output<ColumnDropEventPayload>();
  taskAdded = output<AddTaskEventPayload>();
  columnAdded = output<AddColumnEventPayload>();
  taskUpdated = output<UpdateTaskEventPayload>();
  taskCompletionToggled = output<ToggleTaskCompletionEventPayload>();
  
  // --- Local Reactive State (Signals) ---
  isColumnInputOpen = signal(false);
  columnInputValue = signal('');
  isFilterOpen = signal(false);
  hasActiveFilters = signal(false);

  // 🚀 CLEANUP 1: RxJS to Signal (No Constructor, No DestroyRef needed)
  activeTaskOverlayId = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get('taskId'))),
    { initialValue: null }
  );

  // 🚀 CLEANUP 2: Expensive Getter converted to Highly Optimized Computed Signal
  activeTaskOverlay = computed(() => {
    const taskId = this.activeTaskOverlayId();
    if (!taskId) return null;
    
    const tasksRecord = this.tasksByColumn();
    for (const tasks of Object.values(tasksRecord)) {
      const match = tasks?.find(task => task.id === taskId);
      if (match) return match;
    }
    return null;
  });

  // --- Methods ---

  toggleFilterView(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isFilterOpen.update(v => !v);
  }

  onColumnDropNative(payload: ColumnDropEventPayload): void {
    if (payload.fromIndex === payload.toIndex) return;
    this.columnMoved.emit(payload);
  }

  // 🚀 CLEANUP 3: Removed 10 lines of useless local array mutation (Dead Code)
  onTaskDropNative(payload: TaskDropEventPayload): void {
    if (payload.sourceColumnId === payload.targetColumnId && payload.sourceIndex === payload.targetIndex) {
      return;
    }
    // Parent/Store ka kaam hai arrays ko modify karna, Component ka nahi.
    this.taskMoved.emit(payload); 
  }

  submitTaskInput(columnId: string, title: string): void {
    this.taskAdded.emit({ columnId, title });
  }

  openColumnInput(): void { this.isColumnInputOpen.set(true); }
  
  closeColumnInput(): void {
    this.isColumnInputOpen.set(false);
    this.columnInputValue.set('');
  }

  onColumnInputChange(event: Event): void {
    this.columnInputValue.set((event.target as HTMLInputElement).value);
  }

  submitColumnInput(): void {
    const title = this.columnInputValue().trim();
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

  onFiltersChanged(selection: BoardFilterSelection): void {
    // Signal set kiya
    this.hasActiveFilters.set(
      selection.noMembers || 
      selection.me || 
      selection.completed || 
      selection.incomplete || 
      selection.dueDate !== 'all' || 
      selection.labels.length > 0 || 
      selection.activity.length > 0
    );

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
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, DestroyRef, inject } from '@angular/core';
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

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [ApplyFilterComponent, CommonModule, TaskOverlayComponent, KanbanColumnComponent, MatIconModule],
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
  
  activeTaskOverlayId: string | null = null;
  isColumnInputOpen = false;
  columnInputValue = '';
  isFilterOpen = false;
  hasActiveFilters = false;
  
  @Output() taskMoved = new EventEmitter<TaskDropEventPayload>();
  @Output() columnMoved = new EventEmitter<ColumnDropEventPayload>();
  @Output() taskAdded = new EventEmitter<AddTaskEventPayload>();
  @Output() columnAdded = new EventEmitter<AddColumnEventPayload>();
  @Output() taskUpdated = new EventEmitter<UpdateTaskEventPayload>();
  @Output() taskCompletionToggled = new EventEmitter<ToggleTaskCompletionEventPayload>();
  
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

  // --- Directly Forwarding Native Events ---
  onColumnDropNative(payload: ColumnDropEventPayload): void {
    const { fromIndex, toIndex } = payload;
    if (fromIndex === toIndex) return;

    // 1. Optimistic Update for Columns
    const updatedColumns = [...this.columns];
    const [movedColumn] = updatedColumns.splice(fromIndex, 1);
    updatedColumns.splice(toIndex, 0, movedColumn);
    
    // 2. UI update instant
    this.columns = updatedColumns;

    // 3. Background call
    this.columnMoved.emit(payload);
  }

  onTaskDropNative(payload: TaskDropEventPayload): void {
    const { sourceColumnId, targetColumnId, sourceIndex, targetIndex } = payload;
    
    // Agar same position pe drop hua hai toh ignore karo
    if (sourceColumnId === targetColumnId && sourceIndex === targetIndex) return;

    // 1. Optimistic Update: Arrays ki shallow copy banao (OnPush ko trigger karne ke liye)
    const sourceTasks = [...(this.tasksByColumn[sourceColumnId] || [])];
    const targetTasks = sourceColumnId === targetColumnId ? sourceTasks : [...(this.tasksByColumn[targetColumnId] || [])];

    // 2. Task ko source list se nikalo
    const [movedTask] = sourceTasks.splice(sourceIndex, 1);

    // 3. Same column me niche drag karne par index adjust karo (kyunki array ek element chota ho gaya hai)
    let insertIndex = targetIndex;
    if (sourceColumnId === targetColumnId && sourceIndex < targetIndex) {
      insertIndex--;
    }

    // 4. Task ko naye target pe insert karo
    targetTasks.splice(insertIndex, 0, movedTask);

    // 5. Naye reference ke sath data set karo (UI instant update hoga)
    this.tasksByColumn = {
      ...this.tasksByColumn,
      [sourceColumnId]: sourceTasks,
      [targetColumnId]: targetTasks
    };
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
    for (const tasks of Object.values(this.tasksByColumn)) {
      const match = tasks?.find(task => task.id === this.activeTaskOverlayId);
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

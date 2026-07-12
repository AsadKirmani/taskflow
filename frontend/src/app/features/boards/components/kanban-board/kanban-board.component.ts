import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  computed,
  signal,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Board } from '../../../../core/models/board.model';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import {
  TaskDropEventPayload,
  ColumnDropEventPayload,
  AddTaskEventPayload,
  AddColumnEventPayload,
  UpdateTaskEventPayload,
  ToggleTaskCompletionEventPayload,
} from '../../models/drag-drop.model';
import { TaskStore } from '../../../task/data-access/task-store.service';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { ApplyFilterComponent } from '../filters/filter.component';
import type { BoardFilterSelection } from '../filters/filter-selection.model';
import { TaskComponent } from '../../../task/task.component';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { ArchiveItemsComponent } from '../archive-items.component';
import { UiAvatarStackComponent } from '../../../../ui/components/ui-avatar-stack.component';
import { UiSkeletonComponent } from '../../../../ui/components/ui-skeleton.component';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';
import { KeyboardShortcutsService } from '../../../../core/services/keyboard-shortcuts.service';
import {
  UiDropdownMenuComponent,
  UiDropdownMenuContent,
  UiDropdownMenuTrigger,
} from '../../../../ui/components/ui-dropdown-menu.component';
import { UiDropdownMenuItemComponent } from '../../../../ui/components/ui-dropdown-menu-item.component';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-kanban-board',
  standalone: true,

  imports: [
    ApplyFilterComponent,
    TaskComponent,
    KanbanColumnComponent,
    AutofocusDirective,
    UiAvatarStackComponent,
    DragDropModule,
    ArchiveItemsComponent,
    UiSkeletonComponent,
    UiButtonComponent,
    UiDropdownMenuComponent,
    UiDropdownMenuItemComponent,
    UiDropdownMenuTrigger,
    UiDropdownMenuContent,
    ...APP_ICONS,
  ],
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  private readonly taskStore = inject(TaskStore);
  protected readonly authStore = inject(AuthStoreService);
  protected readonly shortcuts = inject(KeyboardShortcutsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  isArchiveOpen = signal(false);

  constructor() {
    this.shortcuts.createTriggered
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (!this.activeTaskOverlay() && !this.isFilterOpen()) {
          this.openColumnInput();
        }
      });
    this.shortcuts.escapeTriggered
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.isColumnInputOpen()) {
          this.closeColumnInput();
        }
      });
  }

  board = input<Board | null>(null);
  columns = input<BoardColumn[]>([]);
  boardMembers = input<User[]>([]);
  emptyArray = [];
  tasksByColumn = input<Record<string, Task[] | undefined>>({});
  loading = input<boolean>(false);
  columnIds = computed(() => this.columns().map((col) => col.id));
  taskMoved = output<TaskDropEventPayload>();
  columnMoved = output<ColumnDropEventPayload>();
  taskAdded = output<AddTaskEventPayload>();
  columnAdded = output<AddColumnEventPayload>();
  taskUpdated = output<UpdateTaskEventPayload>();
  taskCompletionToggled = output<ToggleTaskCompletionEventPayload>();
  columnArchived = output<{ columnId: string; columnName: string }>();
  visibilityToggled = output<'private' | 'workspace'>();
  closeBoard = output<void>();

  isColumnInputOpen = signal(false);
  columnInputValue = signal('');
  isFilterOpen = signal(false);
  hasActiveFilters = signal(false);

  activeTaskOverlayId = signal<string | null>(null);

  activeTaskOverlay = computed(() => {
    const taskId = this.activeTaskOverlayId();
    if (!taskId) return null;

    const tasksRecord = this.tasksByColumn();
    for (const tasks of Object.values(tasksRecord)) {
      const match = tasks?.find((task) => task.id === taskId);
      if (match) return match;
    }
    return null;
  });

  onColumnDrop(event: CdkDragDrop<BoardColumn[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const currentColumns = [...this.columns()];
    moveItemInArray(currentColumns, event.previousIndex, event.currentIndex);

    this.columnMoved.emit({
      fromIndex: event.previousIndex,
      toIndex: event.currentIndex,
    });
  }

  onTaskDrop(payload: TaskDropEventPayload): void {
    if (
      payload.sourceColumnId === payload.targetColumnId &&
      payload.sourceIndex === payload.targetIndex
    ) {
      return;
    }
    this.taskMoved.emit(payload);
  }

  toggleFilterView(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isFilterOpen.update((v) => !v);
  }

  submitTaskInput(columnId: string, title: string): void {
    this.taskAdded.emit({ columnId, title });
  }

  openColumnInput(): void {
    this.isColumnInputOpen.set(true);
  }

  closeColumnInput(): void {
    this.isColumnInputOpen.set(false);
    this.columnInputValue.set('');
  }

  onColumnInputChange(event: Event): void {
    this.columnInputValue.set((event.target as HTMLTextAreaElement).value);
  }

  submitColumnInput(): void {
    const title = this.columnInputValue().trim();
    this.columnInputValue.set('');
    if (!title) {
      this.closeColumnInput();
      return;
    }
    this.columnAdded.emit({ title });
    this.closeColumnInput();
  }

  openTaskOverlay(task: Task): void {
    this.activeTaskOverlayId.set(task.id);

    const currentUrlTree = this.router.parseUrl(this.router.url);
    const queryString = new URLSearchParams(currentUrlTree.queryParams as Record<string, string>).toString();
    const url = `/t/${task.id}/${this.toSlug(task.title)}${queryString ? '?' + queryString : ''}`;
    this.location.go(url);
  }
  closeTaskOverlay(): void {
    this.activeTaskOverlayId.set(null);
    const boardId = this.route.snapshot.paramMap.get('boardId');
    const currentUrlTree = this.router.parseUrl(this.router.url);
    const queryString = new URLSearchParams(currentUrlTree.queryParams as Record<string, string>).toString();
    this.location.go(`/boards/${boardId}/${this.toSlug(this.board()?.name || '')}${queryString ? '?' + queryString : ''}`);
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;

    if (this.activeTaskOverlay()) {
      this.closeTaskOverlay();
    }

    if (this.isFilterOpen()) {
      this.isFilterOpen.set(false);
    }
    if (this.isColumnInputOpen()) {
      this.closeColumnInput();
    }
  }
  onFiltersChanged(selection: BoardFilterSelection): void {
    this.hasActiveFilters.set(
      selection.noMembers ||
        selection.me ||
        selection.completed ||
        selection.incomplete ||
        selection.dueDate !== 'all' ||
        selection.labels.length > 0 ||
        selection.activity.length > 0,
    );

    const memberScope = selection.noMembers ? 'no_members' : selection.me ? 'me' : 'all';
    const completion =
      selection.completed && selection.incomplete
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
      activity: selection.activity,
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        memberScope: memberScope === 'all' ? null : memberScope,
        completion: completion === 'all' ? null : completion,
        dueType: selection.dueDate === 'all' ? null : selection.dueDate,
        labels: selection.labels.length ? selection.labels.join(',') : null,
        activity: selection.activity.length ? selection.activity.join(',') : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private toSlug(value: string): string {
    return (
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'task'
    );
  }
}

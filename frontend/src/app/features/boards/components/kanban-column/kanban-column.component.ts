import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { TaskDropEventPayload } from '../../models/drag-drop.model';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { UiEmptyStateComponent } from '../../../../ui/components/ui-empty-state.component';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';
import {
  UiDropdownMenuComponent,
  UiDropdownMenuContent,
  UiDropdownMenuTrigger,
} from '../../../../ui/components/ui-dropdown-menu.component';
import { UiDropdownMenuItemComponent } from '../../../../ui/components/ui-dropdown-menu-item.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,

  imports: [
    KanbanTaskComponent,
    CommonModule,
    AutofocusDirective,
    DragDropModule,
    UiButtonComponent,
    UiEmptyStateComponent,
    UiDropdownMenuComponent,
    UiDropdownMenuItemComponent,
    UiDropdownMenuTrigger,
    UiDropdownMenuContent,
    ...APP_ICONS,
  ],
  templateUrl: './kanban-column.component.html',
})
export class KanbanColumnComponent {
  private cdr = inject(ChangeDetectorRef);
  column = input.required<BoardColumn>();
  tasks = input<Task[]>([]);
  columnIndex = input.required<number>();
  hasActiveFilters = input<boolean>(false);
  connectedTo = input<string[]>([]);

  nativeTaskDrop = output<TaskDropEventPayload>();
  taskAdded = output<string>();
  taskUpdated = output<{ taskId: string; title: string }>();
  taskCompletionToggled = output<Task>();
  taskClicked = output<Task>();
  columnArchived = output<{ columnId: string; columnName: string }>();

  isInputOpen = signal(false);
  inputValue = signal('');

  onTaskDrop(event: CdkDragDrop<any[]>) {
    const previousList = event.previousContainer.data;
    const movedTask = previousList[event.previousIndex];
    if (!movedTask) {
      console.error('No task found at index', event.previousIndex);
      return;
    }

    this.nativeTaskDrop.emit({
      taskId: movedTask.id,
      sourceColumnId: event.previousContainer.id,
      targetColumnId: event.container.id,
      sourceIndex: event.previousIndex,
      targetIndex: event.currentIndex,
    });
  }

  onInput(event: Event) {
    this.inputValue.set((event.target as HTMLInputElement).value);
  }

  submitTask() {
    const title = this.inputValue().trim();
    if (title) {
      this.taskAdded.emit(title);
    }
    this.cancelInput();
  }

  cancelInput() {
    this.isInputOpen.set(false);
    this.inputValue.set('');
  }
}

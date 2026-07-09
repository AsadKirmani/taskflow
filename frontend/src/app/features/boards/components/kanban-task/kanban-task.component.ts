import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskFacade } from '../../../task/facades/task.facade';
import { UiAvatarStackComponent } from '../../../../ui/components/ui-avatar-stack.component';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-kanban-task',
  standalone: true,
  imports: [DragDropModule, UiAvatarStackComponent, ...APP_ICONS, DatePipe],
  host: {
    class: 'block w-full cursor-grab active:cursor-grabbing mb-2 select-none touch-none',
  },
  templateUrl: './kanban-task.component.html',
})
export class KanbanTaskComponent {
  task = input.required<Task>();
  facade = inject(TaskFacade);
  columnIndex = input.required<number>();
  sourceColumnId = input.required<string>();
  updateTitle = output<string>();
  toggleCompletion = output<void>();
  openOverlay = output<void>();
  isOverdue = computed(() => {
    const dueDate = this.task().dueDate;
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now && !this.task().isCompleted;
  });
  isEditing = signal(false);
  editValue = signal('');

  startEdit(event?: MouseEvent | KeyboardEvent) {
    event?.stopPropagation();
    this.editValue.set(this.task().title);
    this.isEditing.set(true);
  }

  save() {
    const newVal = this.editValue().trim();
    if (newVal && newVal !== this.task().title) {
      this.updateTitle.emit(newVal);
    }
    this.isEditing.set(false);
  }

  cancel() {
    this.isEditing.set(false);
  }

  onInput(event: Event) {
    this.editValue.set((event.target as HTMLInputElement).value);
  }
  get completedChecklistCount(): number {
    const checklist = this.task().checklist;
    if (!checklist) return 0;

    return checklist.filter((item) => item.isCompleted).length;
  }
  protected readonly avatarUsers = computed(() => {
    const assigneeIds = this.task().assigneeIds || [];
    const members = this.facade.boardMembers();

    return assigneeIds.map((id) => {
      const member = members.find((m) => m.id === id);
      return {
        id: id,
        name: member?.name ?? 'Unknown',
        avatarUrl: member?.avatarUrl ?? undefined,
      };
    });
  });
  onKeydown(event: KeyboardEvent) {
    if (this.isEditing()) {
      return;
    }

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.openOverlay.emit();
        break;

      case ' ': 
        event.preventDefault();
        this.toggleCompletion.emit();
        break;

      case 'e':
      case 'E':
        event.preventDefault();
        this.startEdit(event);
        break;
        case 'Escape':
          if (this.isEditing()) {
            event.preventDefault();
            this.cancel();
          }
          break;
        }
  }
}

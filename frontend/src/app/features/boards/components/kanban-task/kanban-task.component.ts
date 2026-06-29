import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../../../core/models/task.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban-task',
  standalone: true,
  imports: [MatIconModule, DragDropModule],
  host: {
    'class': 'block w-full cursor-grab active:cursor-grabbing mb-2 select-none touch-none',
  },
  templateUrl: './kanban-task.component.html'
})
export class KanbanTaskComponent {
  task = input.required<Task>();
  columnIndex = input.required<number>();
  sourceColumnId = input.required<string>();
  updateTitle = output<string>();
  toggleCompletion = output<void>();
  openOverlay = output<void>();

  isEditing = signal(false);
  editValue = signal('');
  
  startEdit(event?: MouseEvent) {
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
}
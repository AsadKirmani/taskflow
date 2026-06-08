import { Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './task-card.component.html'
})
export class TaskCardComponent {
  task = input.required<Task>();
  columnIndex = input.required<number>();
  sourceColumnId = input.required<string>();
  updateTitle = output<string>();
  toggleCompletion = output<void>();
  openOverlay = output<void>();

  isEditing = signal(false);
  editValue = signal('');
  isDragging = signal(false);

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
  onDragStart(event: DragEvent) {
    event.stopPropagation();
    this.isDragging.set(true);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      const payload = {
        type: 'task',
        taskId: this.task().id,
        sourceColumnId: this.sourceColumnId(),
        sourceIndex: this.columnIndex()
      };
      event.dataTransfer.setData('application/json', JSON.stringify(payload));
    }
  }

  onDragEnd(event: DragEvent) {
    this.isDragging.set(false);
  }
}
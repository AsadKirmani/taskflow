import { Component, ElementRef, inject, input, output } from '@angular/core';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';
import { CommonModule } from '@angular/common';
import { TaskDropEventPayload, ColumnDropEventPayload } from '../../models/drag-drop.model';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [TaskCardComponent, CommonModule],
  templateUrl: './kanban-column.component.html'
})
export class KanbanColumnComponent {
  column = input.required<BoardColumn>();
  tasks = input<Task[]>([]);
  columnIndex = input.required<number>();
  hasActiveFilters = input<boolean>(false);

  nativeTaskDrop = output<TaskDropEventPayload>();
  nativeColumnDrop = output<ColumnDropEventPayload>();
  taskAdded = output<string>();
  taskUpdated = output<{taskId: string, title: string}>();
  taskCompletionToggled = output<Task>();
  taskClicked = output<Task>();

  private el = inject(ElementRef);
  isInputOpen = false;
  inputValue = '';
  isDragOver = false;

  onTaskDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onTaskDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onTaskDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const dataStr = event.dataTransfer?.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      if (data.type === 'task') {
        const targetIndex = this.calculateTaskDropIndex(event.clientY);
        this.nativeTaskDrop.emit({
          taskId: data.taskId,
          sourceColumnId: data.sourceColumnId,
          targetColumnId: this.column().id,
          sourceIndex: data.sourceIndex,
          targetIndex: targetIndex
        });
      }
    } catch (e) {}
  }

  private calculateTaskDropIndex(clientY: number): number {
    const taskCards = Array.from(this.el.nativeElement.querySelectorAll('app-task-card'));
    for (let i = 0; i < taskCards.length; i++) {
      const rect = (taskCards[i] as HTMLElement).getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        return i;
      }
    }
    return this.tasks().length;
  }

  onColumnDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'column',
        sourceIndex: this.columnIndex()
      }));
    }
  }

  onColumnDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onColumnDrop(event: DragEvent) {
    event.preventDefault();
    const dataStr = event.dataTransfer?.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      if (data.type === 'column' && data.sourceIndex !== this.columnIndex()) {
        this.nativeColumnDrop.emit({
          fromIndex: data.sourceIndex,
          toIndex: this.columnIndex()
        });
      }
    } catch (e) {}
  }

  onInput(event: Event) { 
    this.inputValue = (event.target as HTMLInputElement).value; 
  }
  
  submitTask() {
    const title = this.inputValue.trim();
    if (title) { this.taskAdded.emit(title); }
    this.cancelInput();
  }
  
  cancelInput() {
    this.isInputOpen = false;
    this.inputValue = '';
  }
}
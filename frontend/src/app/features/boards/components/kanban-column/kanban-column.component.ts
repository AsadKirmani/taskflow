import { Component, Input, Output, EventEmitter, ElementRef, inject } from '@angular/core';
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
  @Input({ required: true }) column!: BoardColumn;
  @Input() tasks: Task[] = [];
  @Input() columnIndex!: number; // For column reordering
  @Input() hasActiveFilters = false;

  @Output() nativeTaskDrop = new EventEmitter<TaskDropEventPayload>();
  @Output() nativeColumnDrop = new EventEmitter<ColumnDropEventPayload>();
  @Output() taskAdded = new EventEmitter<string>();
  @Output() taskUpdated = new EventEmitter<{taskId: string, title: string}>();
  @Output() taskCompletionToggled = new EventEmitter<Task>();
  @Output() taskClicked = new EventEmitter<Task>();

  private el = inject(ElementRef);
  isInputOpen = false;
  inputValue = '';
  isDragOver = false;

  // --- Task Drop Handlers ---
  onTaskDragOver(event: DragEvent) {
    event.preventDefault(); // Zaroori hai warna browser drop allow nahi karega
    this.isDragOver = true;
  }

  onTaskDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onTaskDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation(); // Column drop trigger na ho
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
          targetColumnId: this.column.id,
          sourceIndex: data.sourceIndex,
          targetIndex: targetIndex
        });
      }
    } catch (e) {}
  }

  // Magic math: Dekho ki mouse kis task ke aadhi height ke upar hai
  private calculateTaskDropIndex(clientY: number): number {
    const taskCards = Array.from(this.el.nativeElement.querySelectorAll('app-task-card'));
    for (let i = 0; i < taskCards.length; i++) {
      const rect = (taskCards[i] as HTMLElement).getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        return i;
      }
    }
    return this.tasks.length; // Agar list ke last mein drop kiya
  }

  // --- Column Drag Handlers ---
  onColumnDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'column',
        sourceIndex: this.columnIndex
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
      if (data.type === 'column' && data.sourceIndex !== this.columnIndex) {
        this.nativeColumnDrop.emit({
          fromIndex: data.sourceIndex,
          toIndex: this.columnIndex
        });
      }
    } catch (e) {}
  }

  // --- Normal Logic ---
  onInput(event: Event) { this.inputValue = (event.target as HTMLInputElement).value; }
  
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
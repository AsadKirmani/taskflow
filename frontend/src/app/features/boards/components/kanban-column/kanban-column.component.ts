import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { TaskDropEventPayload, ColumnDropEventPayload } from '../../models/drag-drop.model';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [KanbanTaskComponent, CommonModule, AutofocusDirective, MatIconModule],
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
  
  // 🚀 Local State converted to Signals
  isInputOpen = signal(false);
  inputValue = signal('');
  isDragOver = signal(false);

  onTaskDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onTaskDragLeave(event: DragEvent) {
    this.isDragOver.set(false);
  }

  // 🚀 FIX #1: Smart Drop Routing
  onTaskDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation(); // Event yahan rok liya...
    this.isDragOver.set(false);

    const dataStr = event.dataTransfer?.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      
      // Agar Task drop hua hai
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
      // 🚀 MAGIC: Agar user ne Column ko utha kar Task area me drop kar diya,
      // toh hum usko silently Column Drop logic me bhej denge!
      else if (data.type === 'column' && data.sourceIndex !== this.columnIndex()) {
        this.nativeColumnDrop.emit({
          fromIndex: data.sourceIndex,
          toIndex: this.columnIndex()
        });
      }
    } catch (e) {
      console.error('Drag data parse error', e);
    }
  }

  private calculateTaskDropIndex(clientY: number): number {
    const taskCards = Array.from(this.el.nativeElement.querySelectorAll('app-kanban-task'));
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
    this.inputValue.set((event.target as HTMLInputElement).value); 
  }
  
  submitTask() {
    const title = this.inputValue().trim();
    if (title) { this.taskAdded.emit(title); }
    this.cancelInput();
  }
  
  cancelInput() {
    this.isInputOpen.set(false);
    this.inputValue.set('');
  }
}
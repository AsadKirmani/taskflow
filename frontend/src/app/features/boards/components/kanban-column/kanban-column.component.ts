import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { TaskDropEventPayload } from '../../models/drag-drop.model';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { ChangeDetectorRef } from '@angular/core';
// 🚀 DragDropModule import kiya
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'; 

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  // 🚀 Imports me DragDropModule add kiya
  imports: [KanbanTaskComponent, CommonModule, AutofocusDirective, MatIconModule, DragDropModule],
  templateUrl: './kanban-column.component.html'
})
export class KanbanColumnComponent {
  private cdr = inject(ChangeDetectorRef);
  column = input.required<BoardColumn>();
  tasks = input<Task[]>([]);
  columnIndex = input.required<number>();
  hasActiveFilters = input<boolean>(false);
  connectedTo = input<string[]>([]); // CDK DropList ke liye connected lists
  // Sirf Task related outputs bachenge yahan
  nativeTaskDrop = output<TaskDropEventPayload>();
  taskAdded = output<string>();
  taskUpdated = output<{taskId: string, title: string}>();
  taskCompletionToggled = output<Task>();
  taskClicked = output<Task>();
  
  isInputOpen = signal(false);
  inputValue = signal('');

  onTaskDrop(event: CdkDragDrop<any[]>) {
  // Hum array mutations store pe chhod rahe hain (kyunki optimistic handle wahan hai)
  // Hum seedha text representation ya task objects se store ke standard parameters bhejenge
  const previousList = event.previousContainer.data;
  const movedTask = previousList[event.previousIndex];
  if (!movedTask){
    console.error('No task found at index', event.previousIndex);
    return;
  } 

  this.nativeTaskDrop.emit({
    taskId: movedTask.id,
    sourceColumnId: event.previousContainer.id,
    targetColumnId: event.container.id,
    sourceIndex: event.previousIndex,
    targetIndex: event.currentIndex
  });
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
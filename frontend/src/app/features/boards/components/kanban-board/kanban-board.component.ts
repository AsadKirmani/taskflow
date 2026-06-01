import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {
  CdkDrag,
  CdkDropList,
  CdkDragDrop,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { Board } from '../../../../core/models/board.model';
import { BoardColumn } from '../../../../core/models/column.model';
import { Task } from '../../../../core/models/task.model';
import { TaskDropEventPayload, ColumnDropEventPayload, AddTaskEventPayload, UpdateTaskEventPayload, ToggleTaskCompletionEventPayload } from '../../models/drag-drop.model';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, MatIconModule],
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanBoardComponent {
  @Input() board: Board | null = null;
  @Input() columns: BoardColumn[] = [];
  @Input() tasksByColumn: Record<string, Task[] | undefined> = {};
  @Input() loading = false;

  activeTaskInputColumnId: string | null = null;
  taskInputValues: Record<string, string | undefined> = {};

  @Output() taskMoved = new EventEmitter<TaskDropEventPayload>();
  @Output() columnMoved = new EventEmitter<ColumnDropEventPayload>();
  @Output() taskAdded = new EventEmitter<AddTaskEventPayload>();
  @Output() taskUpdated = new EventEmitter<UpdateTaskEventPayload>();
  @Output() taskCompletionToggled = new EventEmitter<ToggleTaskCompletionEventPayload>();

  activeEditTaskId: string | null = null;
  editTaskTitle = '';

  get connectedDropListIds(): string[] {
    return this.columns.map(column => column.id);
  }

  onColumnDrop(event: CdkDragDrop<BoardColumn[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.columnMoved.emit({
      fromIndex: event.previousIndex,
      toIndex: event.currentIndex
    });
  }


  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumnId: string): void {
    const task = event.item.data as Task;
    const sourceColumnId = event.previousContainer.id;

    this.taskMoved.emit({
      taskId: task.id,
      sourceColumnId,
      targetColumnId,
      sourceIndex: event.previousIndex,
      targetIndex: event.currentIndex
    });
  }

  isTaskInputOpen(columnId: string): boolean {
    return this.activeTaskInputColumnId === columnId;
  }

  openTaskInput(columnId: string): void {
    this.activeTaskInputColumnId = columnId;
  }

  closeTaskInput(columnId: string): void {
    if (this.activeTaskInputColumnId === columnId) {
      this.activeTaskInputColumnId = null;
    }
  }

  onTaskInputChange(columnId: string, value: string): void {
    this.taskInputValues = {
      ...this.taskInputValues,
      [columnId]: value
    };
  }

  submitTaskInput(columnId: string): void {
    const title = (this.taskInputValues[columnId] ?? '').trim();
    if (!title) {
      this.closeTaskInput(columnId);
      return;
    }

    this.taskAdded.emit({ columnId, title });

    this.taskInputValues = {
      ...this.taskInputValues,
      [columnId]: ''
    };
    this.closeTaskInput(columnId);
  }
  startTaskEdit(task: Task, event?: MouseEvent): void {
    event?.stopPropagation();
    this.activeEditTaskId = task.id;
    this.editTaskTitle = task.title;
  }

  cancelTaskEdit(): void {
    this.activeEditTaskId = null;
    this.editTaskTitle = '';
  }

  onEditTaskTitleChange(value: string): void {
    this.editTaskTitle = value;
  }

  toggleTaskCompletion(task: Task, event?: MouseEvent): void {
    event?.stopPropagation();
    this.taskCompletionToggled.emit({
      taskId: task.id,
      isCompleted: !task.isCompleted
    });
  }

  submitTaskEdit(task: Task): void {
    const title = this.editTaskTitle.trim();
    if (!title || title === task.title) {
      this.cancelTaskEdit();
      return;
    }

    this.taskUpdated.emit({ taskId: task.id, title });
    this.cancelTaskEdit();
  }
  
}
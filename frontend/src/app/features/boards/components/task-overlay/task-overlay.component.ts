import { Component, ElementRef, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './task-overlay.component.html',
  host: {
    '(window:keydown.escape)': 'close()',
    '(click)': 'onBackdropClick($event)'
  }
})
export class TaskOverlayComponent {
  private readonly elementRef = inject(ElementRef);

  task = input<Task | null>(null);
  columnName = input<string>('To Do');

  closed = output<void>();

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {

    if (event.target === this.elementRef.nativeElement) {
      this.close();
    }
  }
}

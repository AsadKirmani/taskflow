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

  // Read-only parameters passed cleanly from the parent board canvas logic
  task = input<Task | null>(null);
  columnName = input<string>('To Do');

  // Unified communication tracking link event pipeline
  closed = output<void>();

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // If the user clicks exactly on the background overlay backdrop mask element
    if (event.target === this.elementRef.nativeElement) {
      this.close();
    }
  }
}

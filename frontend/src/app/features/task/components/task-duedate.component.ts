import { Component, input, output } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { DatePipe } from "@angular/common";


@Component({
  selector: 'app-task-duedate',
  standalone: true,
  imports: [MatIconModule, DatePipe],
    template: `<div class="mb-6">
          
            <div class="flex items-center gap-2 group w-fit">
              <div
                class="flex items-center gap-2 bg-base-200/50 border border-base-content/20 text-base-content p-1 rounded-md"
              >
                <mat-icon>schedule</mat-icon
                >
                @if (startDate() && dueDate()) {
                  <span class="text-sm font-medium text-base-content">
                    {{
                      startDate() | date: 'MMM d, yyyy'
                    }} - {{
                      dueDate() | date: 'MMM d, yyyy'
                    }}</span>
                } @else if (dueDate()) {
                  <span class="text-sm font-medium text-base-content">
                    {{ dueDate() | date: 'MMM d, yyyy' }}</span>
                } @else {
                  <span class="text-sm font-medium text-base-content">
                    {{ startDate() | date: 'MMM d, yyyy' }}</span>
                }
                <button
                  (click)="dueDateRemoved.emit(); startDateRemoved.emit()"
                  class="hover:bg-error/20 text-error rounded-full transition-all flex items-center justify-center p-1"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
          </div>`
})
export class TaskDueDateComponent {
  startDate = input.required<string | null | undefined>();
  dueDate = input.required<string | null | undefined>();
  dueDateRemoved = output<void>();
  startDateRemoved = output<void>();
}
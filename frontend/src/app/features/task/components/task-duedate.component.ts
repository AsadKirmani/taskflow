import { Component, input, output } from "@angular/core";
import { DatePipe } from "@angular/common";
import { APP_ICONS } from "../../../core/icons/lucide-icons";


@Component({
  selector: 'app-task-duedate',
  standalone: true,
  imports: [DatePipe, ...APP_ICONS],
    template: `<div class="mb-6">
          
            <div class="flex items-center gap-2 group w-fit">
              <div
                class="flex items-center gap-2 bg-base-200/50 border border-base-300 text-base-content p-1 rounded-md"
              >
                <svg lucideCalendar class="w-4 h-4 text-base-content/70 flex-shrink-0"></svg>
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
                  <svg lucideX class="w-3 h-3"></svg>
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
import { Component, input, output } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { DatePipe } from "@angular/common";


@Component({
  selector: 'app-task-duedate',
  standalone: true,
  imports: [MatIconModule, DatePipe],
    template: `<div class="mb-6">
            <h3 class="text-xs font-bold text-base-content/70 uppercase mb-2">Due Date</h3>
            <div class="flex items-center gap-2 group w-fit">
              <div
                class="flex items-center gap-2 bg-base-200/50 border border-base-content/10 px-3 py-1.5 rounded-md"
              >
                <mat-icon class="text-base-content/70 text-[18px] w-[18px] h-[18px]"
                  >schedule</mat-icon
                >
                <span class="text-sm font-medium text-base-content">{{
                  dueDate() | date: 'MMM d, yyyy'
                }}</span>
              </div>
              <button
                (click)="removed.emit()"
                class="opacity-0 group-hover:opacity-100 hover:bg-error/20 text-error p-1 rounded transition-all"
              >
                <mat-icon class="text-[18px] w-[18px] h-[18px]">close</mat-icon>
              </button>
            </div>
          </div>`
})
export class TaskDueDateComponent {
  dueDate = input.required<string | null | undefined>();
  removed = output<void>();
}
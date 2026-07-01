import { Component, input, output } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { TaskDates } from '../../../../shared/components/datepicker/custom-datepicker.component';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';

@Component({
  selector: 'app-action-dates',
  standalone: true,
  imports: [...APP_ICONS],
  template: `
    <div class="relative overflow-hidden group w-full">
      <input #datePicker type="date" [value]="currentDate" (change)="onChange($event)" class="absolute opacity-0 w-0 h-0 pointer-events-none" />
      <button (click)="openPicker(datePicker)" class="flex items-center gap-1.5 bg-base-100 group-hover:bg-base-300 text-base-content px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-base-300 w-full">
        <svg lucideCalendar class="w-4 h-4"></svg> Dates
      </button>
    </div>
  `
})
export class ActionDatesComponent {
  dateSelected = output<TaskDates>();
  task = input.required<Task>();

  get currentDate(): string {
    return this.task().dueDate ? new Date(this.task().dueDate ?? Date.now()).toISOString().split('T')[0] : '';
  }

  openPicker(el: HTMLInputElement) {
    try {
      typeof el.showPicker === 'function' ? el.showPicker() : el.click();
    } catch (e) {}
  }

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const selectedDate = new Date(input.value);
      this.dateSelected.emit({
        startDate: this.task().startDate ? new Date(this.task().startDate ?? Date.now()) : null,
        dueDate: selectedDate,
      });
    }
  }
}
// startTime: this.task().startTime || null,
// endTime: this.task().endTime || null
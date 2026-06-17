import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-dates',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="relative overflow-hidden group w-full">
      <input #datePicker type="date" [value]="currentDate" (change)="onChange($event)" class="absolute opacity-0 w-0 h-0 pointer-events-none" />
      <button (click)="openPicker(datePicker)" class="flex items-center gap-1.5 bg-base-100 group-hover:bg-base-300 text-base-content px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-base-content/10 w-full">
        <mat-icon class="text-[18px] w-[18px] h-[18px]">schedule</mat-icon> Dates
      </button>
    </div>
  `
})
export class ActionDatesComponent {
  dueDate = input<string | null | undefined>();
  dateSelected = output<string>();

  get currentDate(): string {
    return this.dueDate() ? new Date(this.dueDate()!).toISOString().split('T')[0] : '';
  }

  openPicker(el: HTMLInputElement) {
    try {
      typeof el.showPicker === 'function' ? el.showPicker() : el.click();
    } catch (e) {}
  }

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.dateSelected.emit(new Date(input.value).toISOString());
    }
  }
}
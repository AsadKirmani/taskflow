import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // 🚀 DatePipe add kiya UI display ke liye
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../../core/services/calendar.service';
import { MatIconModule } from '@angular/material/icon';

// Output Interface
export interface TaskDates {
  startDate: Date | null;
  dueDate: Date | null;
  startTime?: string | null;
  endTime?: string | null;
}

interface CalendarDay {
  value: number;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  hasStart: boolean; // Naya flag
  hasEnd: boolean;
}

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe], // Inject DatePipe for formatting
  templateUrl: './custom-datepicker.component.html'
})
export class CustomDatepickerComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private datePipe = inject(DatePipe);
   
  // Output Event
  dateApplied = output<TaskDates>();
  
  months = this.calendarService.getMonths(); 
  daysOfWeek = this.calendarService.getDaysOfWeek();
  hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  showPicker = signal(false);
  currentMonth = signal(0);
  currentYear = signal(0);
  
  // 🚀 NAYA FEATURE STATE
  activePicker = signal<'start' | 'due'>('due'); // Default 'due' date kyunki log yahi zyada set karte hain
  hasTime = signal(false); // Time optional ho gaya

  startDate = signal<Date | null>(null);
  dueDate = signal<Date | null>(null); // endDate ko dueDate kar diya
  startTime = signal('12:00');
  endTime = signal('12:00');

  blankDays = computed(() => 
    this.calendarService.getBlankDaysOffset(this.currentYear(), this.currentMonth())
  );

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const start = this.startDate();
    const end = this.dueDate();
    
    const hasStart = !!start;
    const hasEnd = !!end;
    
    const totalDays = this.calendarService.getDaysInMonth(year, month);
    const startMs = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime() : null;
    const endMs = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime() : null;

    return Array.from({ length: totalDays }, (_, i) => {
      const dayValue = i + 1;
      const currentMs = new Date(year, month, dayValue).getTime();

      return {
        value: dayValue,
        isStart: startMs !== null && currentMs === startMs,
        isEnd: endMs !== null && currentMs === endMs,
        isInRange: startMs !== null && endMs !== null && currentMs > startMs && currentMs < endMs,
        hasStart: hasStart, // Added
        hasEnd: hasEnd
      };
    });
  });

  // 🚀 Trigger Button UI String
  selectedRangeString = computed(() => {
    const start = this.startDate();
    const due = this.dueDate();
    if (start && due) return 'Start & Due Date set';
    if (start) return `Starts: ${this.datePipe.transform(start, 'MMM d')}`;
    if (due) return `Due: ${this.datePipe.transform(due, 'MMM d')}`;
    return '';
  });

  ngOnInit() {
    const today = new Date();
    this.currentMonth.set(today.getMonth());
    this.currentYear.set(today.getFullYear());
  }

  togglePicker() { this.showPicker.update(v => !v); }
  
  prevMonth() {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else { this.currentMonth.update(m => m - 1); }
  }

  nextMonth() {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else { this.currentMonth.update(m => m + 1); }
  }

  // 🚀 MAGIC SELECTION LOGIC
  selectDay(day: number) {
    const clickedDate = new Date(this.currentYear(), this.currentMonth(), day);
    
    if (this.activePicker() === 'start') {
      this.startDate.set(clickedDate);
      // Agar user start date set kar raha hai aur wo due date se aage nikal jaye, toh due date clear kardo
      if (this.dueDate() && clickedDate > this.dueDate()!) {
        this.dueDate.set(null);
      }
    } else {
      this.dueDate.set(clickedDate);
      // Agar user due date set kar raha hai aur wo start date se pehle ho jaye, toh start date clear kardo
      if (this.startDate() && clickedDate < this.startDate()!) {
        this.startDate.set(null);
      }
    }
  }

  updateTime(type: 'start' | 'due', unit: 'hour' | 'minute', value: string) {
    const signalToUpdate = type === 'start' ? this.startTime : this.endTime;
    const [h, m] = signalToUpdate().split(':');
    if (unit === 'hour') signalToUpdate.set(`${value}:${m}`);
    else signalToUpdate.set(`${h}:${value}`);
  }

  // 🚀 OUTPUT EMITTER
  onSave() {
    this.dateApplied.emit({
      startDate: this.startDate(),
      dueDate: this.dueDate(),
      startTime: this.hasTime() ? this.startTime() : null,
      endTime: this.hasTime() ? this.endTime() : null
    });
    this.showPicker.set(false);
  }

  clearDate(type: 'start' | 'due', event: Event) {
    event.stopPropagation(); // Click ko aage badhne se rokna
    if (type === 'start') this.startDate.set(null);
    else this.dueDate.set(null);
  }
}
// calendar.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  
  // 🚀 Intl API for Dynamic Localization (No hardcoded strings)
  getMonths(locale = 'default', format: 'long' | 'short' = 'long'): string[] {
    return Array.from({ length: 12 }, (_, i) => 
      new Intl.DateTimeFormat(locale, { month: format }).format(new Date(2000, i, 1))
    );
  }

  getDaysOfWeek(locale = 'default', format: 'short' | 'narrow' = 'short'): string[] {
    // 2nd Jan 2000 was a Sunday. We use it as a reference point.
    return Array.from({ length: 7 }, (_, i) => 
      new Intl.DateTimeFormat(locale, { weekday: format }).format(new Date(2000, 0, 2 + i))
    );
  }

  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  getBlankDaysOffset(year: number, month: number): number[] {
    const firstDayIndex = new Date(year, month, 1).getDay();
    return Array.from({ length: firstDayIndex }, (_, i) => i);
  }
}
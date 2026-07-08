import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  searchTriggered = new Subject<void>();
  createTriggered = new Subject<void>();
  escapeTriggered = new Subject<void>();
  addTaskTriggered = new Subject<{ columnId?: string } | undefined>();

  activeColumnId: string | null = null;
  setActiveColumnId(columnId: string | null) {
    this.activeColumnId = columnId;
  }

  triggerSearch() {
    this.searchTriggered.next();
  }
  triggerCreate() {
    this.createTriggered.next();
  }
  triggerEscape() {
    this.escapeTriggered.next();
  }
  triggerAddTask(columnId?: string) {
    this.addTaskTriggered.next(columnId ? { columnId } : undefined);
  }
}

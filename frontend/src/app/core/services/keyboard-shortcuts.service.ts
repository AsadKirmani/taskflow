import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  // Global event emitters
  searchTriggered = new Subject<void>();
  createTriggered = new Subject<void>();
  escapeTriggered = new Subject<void>();

  triggerSearch() { this.searchTriggered.next(); }
  triggerCreate() { this.createTriggered.next(); }
  triggerEscape() { this.escapeTriggered.next(); }
}
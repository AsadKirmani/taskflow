import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ShareExportComponent } from '../../../shared/components/share-export.component';
import { TaskFacade } from '../facades/task.facade';

@Component({
  selector: 'app-task-menu',
  standalone: true,
  imports: [MatIconModule, ShareExportComponent],
  template: `<div class="relative">
    <button
      class="p-1 flex items-center justify-center hover:bg-base-200 rounded-full text-sm font-medium text-base-content transition-colors"
      (click)="isOpen.set(!isOpen())"
    >
      <mat-icon>more_horiz</mat-icon>
    </button>
    @if (isOpen()) {
      <div class="absolute inset-0 z-40" (click)="isOpen.set(false)"></div>
      <div
        class="absolute right-0 mt-2 w-48 bg-base-100 rounded-box shadow-lg border border-base-content/30 z-50"
      >
        <div class="p-2">
          <button
            class="w-full text-left px-4 py-2 text-sm text-base-content rounded-field hover:bg-base-200 flex items-center justify-between"
          >
            Copy Link
          </button>
          <button
            class="w-full text-left px-4 py-2 text-sm text-base-content rounded-field hover:bg-base-200 flex items-center gap-2"
          >
            <span>Move</span>
          </button>
          <div class="border-t border-base-content/30 my-1">
            <app-share-export
              [dataToExport]="facade.currentTask()"
              [exportFileName]="'task-' + facade.currentTask()?.id"
            >
            </app-share-export>
            <button
              class="w-full mt-1 text-left px-4 py-2 text-sm text-base-content rounded-field hover:bg-base-200 flex items-center gap-2"
            >
              <span>Archive</span>
            </button>
          </div>
        </div>
      </div>
    }
  </div>`,
})
export class TaskMenuComponent {
  facade = inject(TaskFacade);
  isOpen = signal(false);
}

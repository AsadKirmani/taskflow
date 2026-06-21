import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-attachments',
  imports: [MatIconModule, CommonModule],
  standalone: true,
  template: `<div class="flex items-start gap-3">
    <mat-icon class="text-base-content w-6 h-6 flex-shrink-0">attachment</mat-icon>
    <div class="flex-1">
      <h3 class="font-semibold text-base mb-3 text-base-content">Attachments</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        @for (file of attachments(); track file.name) {
          <div
            class="flex items-center gap-3 p-2 rounded-md border border-base-content/10 hover:bg-base-200 transition-colors cursor-pointer group"
          >
            <div
              class="w-12 h-12 bg-base-200 rounded flex items-center justify-center flex-shrink-0 text-base-content/70 group-hover:text-base-content transition-colors"
            >
             
              <span>🔥</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-base-content truncate m-0 group-hover:underline">
                {{ file.name }}
              </p>
              <p class="text-xs text-base-content/70 m-0 mt-0.5">Added just now</p>
            </div>
          </div>
        }
      </div>
    </div>
  </div>`,
})
export class TaskAttachmentsComponent {
  attachments = input<{ name: string; url: string }[]>([]);
}

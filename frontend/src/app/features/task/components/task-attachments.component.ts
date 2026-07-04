import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { APP_ICONS } from '../../../core/icons/lucide-icons';

@Component({
  selector: 'app-task-attachments',
  imports: [CommonModule, ...APP_ICONS],
  standalone: true,
  template: `<div class="flex items-start gap-3">
    <svg lucidePaperclip class="w-5 h-5 text-base-content/70 flex-shrink-0"></svg>
    <div class="flex-1">
      <h3 class="font-semibold text-base mb-3 text-base-content">Attachments</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        @for (file of attachments(); track file.url) {
          <a
            [href]="file.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-2 rounded-md border border-base-300 hover:bg-base-200 transition-colors cursor-pointer group no-underline"
          >
            <div
              class="w-12 h-12 bg-base-200 rounded flex items-center justify-center flex-shrink-0 text-base-content/70 group-hover:text-base-content transition-colors overflow-hidden"
            >
              @if (file.url.match('.(jpeg|jpg|gif|png)$')) {
                <img [src]="file.url" alt="preview" class="w-full h-full object-cover" />
              } @else {
                <svg lucideFileText class="w-6 h-6"></svg>
              }
            </div>

            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-semibold text-base-content truncate m-0 group-hover:underline group-hover:text-primary"
              >
                {{ file.filename }}
              </p>
              <p class="text-xs text-base-content/70 m-0 mt-0.5 hover:text-primary">
                Click to view
              </p>
            </div>
          </a>
        }
      </div>
    </div>
  </div>`,
})
export class TaskAttachmentsComponent {
  attachments = input<{ filename: string; url: string; format?: string; uploadedAt?: string }[]>(
    [],
  );
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService, ToastType } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none sm:bottom-6 sm:right-6">
      
      @for (toast of toastService.toasts(); track toast.id) {
        
        <div 
          class="pointer-events-auto flex items-start gap-3 p-4 bg-base-100 border border-base-content/10 shadow-xl rounded-xl w-full sm:w-96 transform transition-all animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <div class="text-success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </div>
              }
              @case ('error') {
                <div class="text-error">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                </div>
              }
              @default {
                <div class="text-info">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                </div>
              }
            }
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-base-content">{{ toast.title }}</h4>
            @if (toast.message) {
              <p class="text-sm text-base-content/70 mt-1 line-clamp-2">{{ toast.message }}</p>
            }
          </div>

          <button 
            (click)="toastService.remove(toast.id)" 
            class="shrink-0 p-1 rounded-md text-base-content/40 hover:text-base-content hover:bg-base-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  toastService = inject(NotificationService);
}
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService, ToastType } from '../../core/services/notification.service';
import { APP_ICONS } from '../../core/icons/lucide-icons';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [...APP_ICONS],
  template: `
    <div
      class="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none sm:bottom-6 sm:right-6"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div [class]="getToastClasses(toast.type)">
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                
                  <svg lucideCircleCheck class="w-5 h-5"></svg>
                
              }
              @case ('error') {
                <svg lucideCircleX class="w-5 h-5"></svg>
                
              }
              @case ('warning') {
                <svg lucideTriangleAlert class="w-5 h-5"></svg>
                
              }
              @default {
                <svg lucideInfo class="w-5 h-5"></svg>
               
              }
            }
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold">{{ toast.title }}</h4>
            @if (toast.message) {
              <p class="text-sm mt-1 line-clamp-2">{{ toast.message }}</p>
            }
          </div>

          <button
            (click)="toastService.remove(toast.id)"
            class="shrink-0 p-1 rounded-btn hover:bg-base-content transition-colors"
          >
            <svg lucideX class="w-4 h-4"></svg>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  toastService = inject(NotificationService);

  getToastClasses(type: ToastType): string {
    const base =
      'pointer-events-auto flex items-start gap-3 p-4 shadow-xl rounded-xl w-full sm:w-96 transform transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 border';

    const variants: Record<string, string> = {
      success: 'bg-success border-success/20 text-success-content',
      error: 'bg-error border-error/20 text-error-content',
      warning: 'bg-warning border-warning/20 text-warning-content',
      info: 'bg-info border-info/20 text-info-content',
    };

    return `${base} ${variants[type] || 'bg-base-100 border-base-300/10 text-base-content'}`;
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto flex items-center gap-3 p-4 min-w-[300px] max-w-sm bg-base-100 border border-base-300 shadow-xl rounded-box transform transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5"
          [ngClass]="{
            'border-l-4 border-l-green-500': toast.type === 'success',
            'border-l-4 border-l-red-500': toast.type === 'error',
            'border-l-4 border-l-blue-500': toast.type === 'info',
            'border-l-4 border-l-yellow-500': toast.type === 'warning'
          }"
        >
          
          @if (toast.type === 'success') {
            <svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          }
          @if (toast.type === 'error') {
            <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          }
          @if (toast.type === 'info') {
            <svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          }
          @if (toast.type === 'warning') {
            <svg class="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          }

          <p class="text-sm font-medium text-base-content flex-1 m-0">{{ toast.message }}</p>

          <button 
            (click)="notificationService.remove(toast.id)" 
            class="text-base-content/50 hover:text-base-content bg-transparent border-none cursor-pointer p-1 rounded transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);
}
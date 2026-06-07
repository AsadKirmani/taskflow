import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.update(currentToasts => [...currentToasts, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration?: number) { this.show(message, 'success', duration); }
  error(message: string, duration?: number) { this.show(message, 'error', duration); }
  info(message: string, duration?: number) { this.show(message, 'info', duration); }
  warning(message: string, duration?: number) { this.show(message, 'warning', duration); }

  remove(id: string) {
    this.toasts.update(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }
}
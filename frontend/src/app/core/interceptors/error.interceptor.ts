import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error?.message || error.message || 'Something went wrong. Please try again.';
      const isAuthCheckEndpoint = req.url.includes('/api/v1/auth/refresh') || req.url.includes('/api/v1/auth/me');
      if(error.status === 401 && isAuthCheckEndpoint) {
        return throwError(() => error);
      }
      else if (!req.headers.has('x-skip-global-error')) {
        notificationService.error(message);
      }

      return throwError(() => error);
    }),
  );
};

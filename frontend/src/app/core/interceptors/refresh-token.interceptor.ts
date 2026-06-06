import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Subject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';
import { TokenService } from '../services/token.service';

let isRefreshing = false;
const refreshQueue$ = new Subject<string>();

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStoreService);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      
      const isAuthEndpoint =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh-token');

      if (!isUnauthorized || isAuthEndpoint) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        return authStore.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = tokenService.getAccessToken();
            isRefreshing = false;
            
            if (!newToken) {
              authStore.clearSession(true);
              return throwError(() => new Error('Token assignment mismatch'));
            }

            refreshQueue$.next(newToken);

            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              })
            );
          }),
          catchError(refreshError => {
            isRefreshing = false;
            authStore.clearSession(true);
            return throwError(() => refreshError);
          })
        );
      }

      return refreshQueue$.pipe(
        take(1), 
        switchMap(token =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            })
          )
        )
      );
    })
  );
};

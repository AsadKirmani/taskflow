import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Subject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';
import { TokenService } from '../services/token.service';

// Mutex flags to manage concurrent request queues
let isRefreshing = false;
const refreshQueue$ = new Subject<string>();

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStoreService);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      
      // Never attempt token rotation on auth gateway paths
      const isAuthEndpoint =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh-token');

      if (!isUnauthorized || isAuthEndpoint) {
        return throwError(() => error);
      }

      // SCENARIO A: You are the primary request that encountered the 401 barrier.
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

            // Notify all other waiting concurrent requests in the stream queue
            refreshQueue$.next(newToken);

            // Replay this primary request with the clean token validated
            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              })
            );
          }),
          catchError(refreshError => {
            isRefreshing = false;
            authStore.clearSession(true); // Evict session if the refresh token is also dead
            return throwError(() => refreshError);
          })
        );
      }

      // SCENARIO B: A token rotation is already processing. Stale the request safely.
      return refreshQueue$.pipe(
        take(1), // Immediately close subscription once an item is delivered
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

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, switchMap, throwError, Subject, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';

let isRefreshing = false;
const refreshTokenSubject = new Subject<string | null>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const isPublicAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh-token');

  if (isPublicAuthEndpoint) {
    return next(req);
  }

  const injector = inject(Injector);

  const tokenService = injector.get(TokenService);
  const authStore = injector.get(AuthStoreService);

  const token = tokenService.getAccessToken(); 
  let authReq = req;
  
  if (token && token !== 'undefined' && token !== 'null') {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: any) => {
      if (
        error instanceof HttpErrorResponse && 
        error.status === 401 && 
        error.error?.code === 'ACCESS_TOKEN_EXPIRED'
      ) {
        return handle401Error(req, next, tokenService, authStore);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService,
  authStore: AuthStoreService
): Observable<any> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      switchMap((newToken) => {
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        }));
      })
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authStore.refreshAccessToken().pipe(
    switchMap((response: any) => {
      isRefreshing = false;
      const newAccessToken = response.data?.accessToken;
      
      refreshTokenSubject.next(newAccessToken);

      return next(request.clone({
        setHeaders: { Authorization: `Bearer ${newAccessToken}` }
      }));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      
      tokenService.clear(); 
      authStore.clearSession(true);
      
      return throwError(() => refreshError);
    })
  );
}
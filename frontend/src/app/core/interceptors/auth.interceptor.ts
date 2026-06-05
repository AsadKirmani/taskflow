import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Subject, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

let isRefreshing = false;
const refreshTokenSubject = new Subject<string | null>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  // 💡 FIXED: Catch any route containing '/auth/' globally to protect the gateway 
  // from accidental header tampering (login, register, refresh, logout)
  const isAuthEndpoint = req.url.includes('/auth/');

  if (isAuthEndpoint) {
    return next(req);
  }

  // 2. Extract token cleanly from memory
  const token = tokenService.getAccessTokenRaw();
  let authReq = req;
  
  // 💡 FIXED: Strict defense against literal "undefined" or "null" strings breaking backend parsers
  if (token && token !== 'undefined' && token !== 'null') {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 3. Process request
  return next(authReq).pipe(
    catchError((error: any) => {
      if (
        error instanceof HttpErrorResponse && 
        error.status === 401 && 
        error.error?.code === 'ACCESS_TOKEN_EXPIRED'
      ) {
        return handle401Error(req, next, tokenService);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Syncs concurrent 401 streams into a single flight rotation call
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService
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

  return tokenService.refreshAccessTokenApiCall().pipe(
    switchMap((response: any) => {
      isRefreshing = false;
      
      const newAccessToken = response.data?.accessToken;
      tokenService.saveAccessTokenInMemory(newAccessToken);
      
      refreshTokenSubject.next(newAccessToken);

      return next(request.clone({
        setHeaders: { Authorization: `Bearer ${newAccessToken}` }
      }));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      
      tokenService.clearAllTokens();
      window.location.href = '/login';
      
      return throwError(() => refreshError);
    })
  );
}

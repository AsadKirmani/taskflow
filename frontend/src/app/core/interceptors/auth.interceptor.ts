import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Subject, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

// Mutex-like flags to prevent parallel request spam
let isRefreshing = false;
const refreshTokenSubject = new Subject<string | null>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  // 1. Bypass authentication headers entirely for auth endpoints
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh-token');

  if (isAuthEndpoint) {
    return next(req);
  }

  // 2. Clone the request to attach the current access token from memory
  const token = tokenService.getAccessTokenRaw(); // Pure getter, NO side-effects!
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 3. Send the request and listen reactively for failures
  return next(authReq).pipe(
    catchError((error: any) => {
      // Catch the explicit expired error code sent by your backend middleware
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
 * Synchronizes and queues matching 401 requests into a single database refresh hook
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService
): Observable<any> {
  
  // Scenario A: A refresh operation is already in flight. Queue this request!
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      switchMap((newToken) => {
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        }));
      })
    );
  }

  // Scenario B: This is the first request to fail. Trigger the token rotation!
  isRefreshing = true;
  refreshTokenSubject.next(null);

  return tokenService.refreshAccessTokenApiCall().pipe(
    switchMap((response: any) => {
      isRefreshing = false;
      
      const newAccessToken = response.data?.accessToken;
      tokenService.saveAccessTokenInMemory(newAccessToken); // Save the fresh token
      
      refreshTokenSubject.next(newAccessToken); // Release all queued requests in the subject

      // Replay the original request with the new access token attached
      return next(request.clone({
        setHeaders: { Authorization: `Bearer ${newAccessToken}` }
      }));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      
      // Critical Fallback: If the refresh token is also dead, clear session and force login
      tokenService.clearAllTokens();
      window.location.href = '/login';
      
      return throwError(() => refreshError);
    })
  );
}

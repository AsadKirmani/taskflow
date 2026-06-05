import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  
  // 1. Strictly bypass auth gateway routes
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh-token');

  if (isAuthEndpoint) {
    return next(req);
  }

  // 2. Read the token straight from memory (A pure getter with NO internal API side-effects!)
  const token = tokenService.getAccessToken();

  // 3. Inject the header cleanly if the token string exists
  if (token) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    );
  }

  // 4. Fallback if no token is loaded yet (e.g., initial application boot)
  return next(req);
};

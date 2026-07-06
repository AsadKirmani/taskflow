import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { Observable, of, tap, catchError, shareReplay, throwError, finalize } from 'rxjs';
import { LoginRequest, RegisterRequest } from '../../../core/models/auth.model';
import { AuthApiService } from './auth-api.service';
import { TokenService } from '../../../core/services/token.service';

type AuthState = {
  currentUser: any | null;
  activeToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
};

const initialState: AuthState = {
  currentUser: null,
  activeToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
};

export const AuthStoreService = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods(
    (
      store,
      authApi = inject(AuthApiService),
      tokenService = inject(TokenService),
      router = inject(Router)
    ) => {
      let refreshRequest$: Observable<any> | null = null;

      const clearSession = (navigate = true) => {
        tokenService.setAccessToken(null);
        patchState(store, {
          currentUser: null,
          activeToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
        if (navigate) {
          router.navigate(['/auth/login']);
        }
      };

      const setSession = (user: any, accessToken: string) => {
        tokenService.setAccessToken(accessToken);
        patchState(store, {
          currentUser: user,
          activeToken: accessToken,
          isAuthenticated: true,
          isInitialized: true,
        });
      };

      return {
        clearSession,
        
        login(payload: LoginRequest): Observable<any> {
          patchState(store, { isLoading: true });
          return authApi.login(payload).pipe(
            tap((response) => {
              setSession(response.data.user, response.data.accessToken);
              patchState(store, { isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              return throwError(() => err);
            })
          );
        },

        register(payload: RegisterRequest): Observable<any> {
          patchState(store, { isLoading: true });
          return authApi.register(payload).pipe(
            tap((response) => {
              setSession(response.data.user, response.data.accessToken);
              patchState(store, { isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              return throwError(() => err);
            })
          );
        },

        refreshAccessToken(): Observable<any> {
          if (refreshRequest$) {
            return refreshRequest$;
          }
          refreshRequest$ = authApi.refreshToken().pipe(
            tap((response) => {
              const { accessToken, user } = response.data;
              tokenService.setAccessToken(accessToken);
              patchState(store, {
                activeToken: accessToken,
                currentUser: user,
                isAuthenticated: true,
              });
            }),
            catchError((err) => throwError(() => err)),
            finalize(() => {
              refreshRequest$ = null;
            }),
            shareReplay({ bufferSize: 1, refCount: true })
          );
          return refreshRequest$;
        },

        initializeSession(): Observable<any> {
          if (store.isInitialized() && store.isAuthenticated()) {
            return of(null);
          }
          return this.refreshAccessToken().pipe(
            tap((response) => {
              const accessToken = response?.data?.accessToken || tokenService.getAccessToken();
              if (!accessToken) {
                throw new Error('No fresh token available');
              }
              patchState(store, { isInitialized: true });
            }),
            catchError((err) => {
              console.error('Initialization failed:', err);
              clearSession(false);
              return of(null);
            })
          );
        },

        logout(navigate = true): void {
          authApi.logout().pipe(
            tap({
              next: () => clearSession(navigate),
              error: () => clearSession(navigate),
            })
          ).subscribe();
        },

        updateUserProfile(updatedUser: any): void {
          const current = store.currentUser();
          if (current) {
            patchState(store, { currentUser: { ...current, ...updatedUser } });
          }
        },
      };
    }
  )
);
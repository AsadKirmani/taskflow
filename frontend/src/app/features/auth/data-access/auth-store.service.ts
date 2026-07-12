import { inject } from '@angular/core';
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
    ) => {
      let refreshRequest$: Observable<any> | null = null;

      const clearSession = (navigate = true) => {
        tokenService.setAccessToken(null);
        localStorage.removeItem("is_logged_in");
        patchState(store, {
          currentUser: null,
          activeToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      };

      const setSession = (user: any, accessToken: string) => {
        tokenService.setAccessToken(accessToken);
        localStorage.setItem("is_logged_in", "true");
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
              setSession(user, accessToken);
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

        logout(): Observable<any> {
          return authApi.logout().pipe(
            tap(() => {
              clearSession();
            }),
            catchError(() => {
              clearSession();
              return of(null);
            })
          );
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
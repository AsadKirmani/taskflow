import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap, switchMap, catchError, shareReplay, throwError } from 'rxjs';
import { SessionState, LoginRequest, RegisterRequest } from '../../../core/models/auth.model';
import { AuthApiService } from './auth-api.service';
import { TokenService } from '../../../core/services/token.service';

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  
  private refreshRequest$: Observable<any> | null = null;

  private readonly state = signal<SessionState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    initialized: false
  });

  readonly currentUser = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly isInitialized = computed(() => this.state().initialized);
  readonly isLoading = computed(() => this.state().loading);
  readonly activeToken = computed(() => this.state().accessToken);

  login(payload: LoginRequest): Observable<any> {
    this.updateState({ loading: true });

    return this.authApi.login(payload).pipe(
      tap(response => {
        this.setSession(response.data.user, response.data.accessToken);
        this.updateState({ loading: false });
      }),
      catchError(err => {
        this.updateState({ loading: false });
        return throwError(() => err);
      })
    );
  }

  register(payload: RegisterRequest): Observable<any> {
    this.updateState({ loading: true });

    return this.authApi.register(payload).pipe(
      tap(response => {
        this.setSession(response.data.user, response.data.accessToken);
        this.updateState({ loading: false });
      }),
      catchError(err => {
        this.updateState({ loading: false });
        return throwError(() => err);
      })
    );
  }

  initializeSession(): Observable<any> {
  if (this.state().initialized && this.state().isAuthenticated) {
    return of(null);
  }

  return this.refreshAccessToken().pipe(
    switchMap((refreshResponse) => {
      const freshToken = refreshResponse?.data?.accessToken || this.tokenService.getAccessToken();
      
      if (!freshToken) {
        throw new Error('No fresh token available');
      }
      return this.authApi.me();
    }),
    tap(response => {
      this.updateState({
        user: response.data.user,
        accessToken: this.tokenService.getAccessToken(),
        isAuthenticated: true,
        initialized: true
      });
    }),
    catchError((err) => {
      console.error('Initialization failed:', err);
      this.clearSession(false);
      this.updateState({ initialized: true });
      return of(null);
    })
  );
}

  refreshAccessToken(): Observable<any> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.authApi.refreshToken().pipe(
      tap(response => {
        const token = response.data.accessToken;
        this.tokenService.setAccessToken(token);
        
        this.updateState({
          accessToken: token,
          isAuthenticated: true
        });
      }),
      catchError(err => {
        this.refreshRequest$ = null;
        return throwError(() => err);
      }),
      tap({
        subscribe: () => {},
        finalize: () => {
          this.refreshRequest$ = null;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.refreshRequest$;
  }

  logout(navigate = true): void {
    this.authApi.logout().pipe(
      tap({
        next: () => this.clearSession(navigate),
        error: () => this.clearSession(navigate)
      })
    ).subscribe();
  }

  clearSession(navigate = true): void {
    this.tokenService.setAccessToken(null);
    
    this.state.set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      initialized: true 
    });

    if (navigate) {
      this.router.navigate(['/auth/login']);
    }
  }

  private setSession(user: any, accessToken: string): void {
    this.tokenService.setAccessToken(accessToken);

    this.updateState({
      user,
      accessToken,
      isAuthenticated: true,
      initialized: true
    });
  }

  private updateState(partial: Partial<SessionState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}
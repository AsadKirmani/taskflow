import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap, finalize, switchMap, catchError, shareReplay } from 'rxjs';
import { SessionState, LoginRequest, RegisterRequest } from '../../../core/models/auth.model';
import { AuthApiService } from './auth-api.service';
import { TokenService } from '../../../core/services/token.service';

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  
  private refreshRequest$: Observable<any> | null = null;

  // ==========================================
  // 1. THE ROOT STATE (Signals Core Vault)
  // ==========================================
  private readonly state = signal<SessionState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    initialized: false
  });

  // ==========================================
  // 2. EXPOSED COMPUTED RE-SELECTORS
  // ==========================================
  // Components read these instantly as plain functions. Zero async overhead!
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
      }),
      finalize(() => this.updateState({ loading: false }))
    );
  }

  register(payload: RegisterRequest): Observable<any> {
    this.updateState({ loading: true });

    return this.authApi.register(payload).pipe(
      tap(response => {
        this.setSession(response.data.user, response.data.accessToken);
      }),
      finalize(() => this.updateState({ loading: false }))
    );
  }

  /**
   * 💡 FIXED CAPTURE GATEWAY
   * This should be executed EXACTLY ONCE when the app boots up (inside app.config.ts APP_INITIALIZER).
   * It should never be re-run inside standard routing guards.
   */
  initializeSession(): Observable<any> {
    // If the app is already verified, bypass the network check completely!
    if (this.state().initialized && this.state().isAuthenticated) {
      return of(null);
    }

    return this.refreshAccessToken().pipe(
      switchMap(() => this.authApi.me()),
      tap(response => {
        this.updateState({
          user: response.data.user,
          accessToken: this.tokenService.getAccessToken(),
          isAuthenticated: true,
          initialized: true
        });
      }),
      catchError((err) => {
        this.clearSession(false);
        this.updateState({ initialized: true });
        return of(null);
      })
    );
  }

  /**
   * Safe, single-flight token rotation stream handler
   */
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
      finalize(() => {
        this.refreshRequest$ = null; // Free memory reference lock
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.refreshRequest$;
  }

  logout(navigate = true): void {
    this.authApi.logout().pipe(
      finalize(() => this.clearSession(navigate))
    ).subscribe();
  }

  clearSession(navigate = true): void {
    this.tokenService.setAccessToken(null);
    
    this.state.set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      initialized: true // Keep true so initialization loaders don't hang indefinitely
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

  /**
   * Atomic Signal state tracking modifier method
   */
  private updateState(partial: Partial<SessionState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}

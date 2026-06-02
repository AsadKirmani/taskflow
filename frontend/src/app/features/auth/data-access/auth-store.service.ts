import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SessionState, LoginRequest, RegisterRequest } from '../../../core/models/auth.model';
import { AuthApiService } from './auth-api.service';
import { TokenService } from '../../../core/services/token.service';

const initialSessionState: SessionState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  initialized: false
};

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private refreshRequest$: Observable<unknown> | null = null;

  private readonly stateSubject = new BehaviorSubject<SessionState>(initialSessionState);
  readonly state$ = this.stateSubject.asObservable();

  readonly user$ = this.state$.pipe(map(state => state.user));
  readonly isAuthenticated$ = this.state$.pipe(map(state => state.isAuthenticated));
  readonly initialized$ = this.state$.pipe(map(state => state.initialized));
  readonly accessToken$ = this.state$.pipe(map(state => state.accessToken));
  readonly loading$ = this.state$.pipe(map(state => state.loading));

  login(payload: LoginRequest) {
    this.patchState({ loading: true });

    return this.authApi.login(payload).pipe(
      tap(response => {
        this.setSession(response.data.user, response.data.accessToken);
      }),
      finalize(() => this.patchState({ loading: false }))
    );
  }

  register(payload: RegisterRequest) {
    this.patchState({ loading: true });

    return this.authApi.register(payload).pipe(
      tap(response => {
        this.setSession(response.data.user, response.data.accessToken);
      }),
      finalize(() => this.patchState({ loading: false }))
    );
  }

  initializeSession(): Observable<unknown> {
    return this.refreshAccessToken().pipe(
      switchMap(() => this.authApi.me()),
      tap(response => {
        this.patchState({
          user: response.data.user,
          accessToken: this.tokenService.getAccessToken(),
          isAuthenticated: true,
          initialized: true
        });
      }),
      catchError(() => {
        this.clearSession(false);
        this.patchState({ initialized: true });
        return of(null);
      })
    );
  }

  refreshAccessToken() {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.authApi.refreshToken().pipe(
      tap(response => {
        const token = response.data.accessToken;
        this.tokenService.setAccessToken(token);
        this.patchState({
          accessToken: token,
          isAuthenticated: true
        });
      }),
      finalize(() => {
        this.refreshRequest$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.refreshRequest$;
  }

  logout(navigate = true): void {
    this.authApi.logout().subscribe({
      next: () => this.clearSession(navigate),
      error: () => this.clearSession(navigate)
    });
  }

  clearSession(navigate = true): void {
    // Clear only the access token, not the refresh token
    this.tokenService.setAccessToken(null);
    this.stateSubject.next({
      ...initialSessionState,
      initialized: true
    });

    if (navigate) {
      this.router.navigate(['/auth/login']);
    }
  }

  private setSession(user: SessionState['user'], accessToken: string): void {
    this.tokenService.setAccessToken(accessToken);

    this.patchState({
      user,
      accessToken,
      isAuthenticated: true,
      initialized: true
    });
  }

  private patchState(partial: Partial<SessionState>): void {
    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      ...partial
    });
  }
}
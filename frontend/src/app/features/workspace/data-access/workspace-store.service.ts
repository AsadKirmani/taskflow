import { Injectable, Input, inject } from '@angular/core';
import { WorkspaceApiService } from './workspace-api.service';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { Workspace } from '../../../core/models/workspace.model';
import { AuthStoreService } from '../../auth/data-access/auth-store.service';
import { filter, switchMap, take } from 'rxjs/operators';


interface WorkspaceState {
  workspaces: Workspace[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialWorkspaceState: WorkspaceState = {
  workspaces: [],
  loading: false,
  loaded: false,
  error: null
};

@Injectable({ providedIn: 'root' })
export class WorkspaceStoreService {
  private readonly authStore = inject(AuthStoreService);
  private readonly workspaceApi = inject(WorkspaceApiService);
  
  private readonly stateSubject = new BehaviorSubject<WorkspaceState>(initialWorkspaceState);
  
  readonly state$ = this.stateSubject.asObservable();
  readonly workspaceName$ = this.state$.pipe(
    filter(state => state.loaded),
    switchMap(state => {
      const names = state.workspaces.map(ws => ws.name);
      return [names];
    })
  );
  

  loadWorkspaces(force = false): void {
    if (this.stateSubject.value.loading) {
      return;
    }

    if (this.stateSubject.value.loaded && !force) {
      return;
    }

    this.stateSubject.next({
      ...this.stateSubject.value,
      loading: true,
      error: null
    });

    this.authStore.state$
      .pipe(
        filter(state => state.initialized),
        take(1),
        switchMap(state => {
          if (!state.isAuthenticated) {
            this.stateSubject.next({
              ...this.stateSubject.value,
              loading: false,
              loaded: true,
              error: 'Unauthorized'
            });
            return EMPTY;
          }

          return this.workspaceApi.getWorkspaces();
        })
      )
      .subscribe({
        next: response => {
          const payload = response.data as Workspace[] | { items?: Workspace[] };
          const workspaces = Array.isArray(payload) ? payload : (payload.items ?? []);
          
          this.stateSubject.next({
            ...this.stateSubject.value,
            workspaces,
            loading: false,
            loaded: true,
            error: null
          });
        },
        error: error => {
          this.stateSubject.next({
            ...this.stateSubject.value,
            loading: false,
            loaded: true,
            error: error?.message ?? 'Failed to load workspaces'
          });
        }
      });
  }
}

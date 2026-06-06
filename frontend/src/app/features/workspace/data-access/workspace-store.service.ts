import { Injectable, inject, signal, computed } from '@angular/core';
import { WorkspaceApiService } from './workspace-api.service';
import { Workspace } from '../../../core/models/workspace.model';
import { AuthStoreService } from '../../auth/data-access/auth-store.service';

interface WorkspaceState {
  workspaces: Workspace[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceStoreService {
  private readonly authStore = inject(AuthStoreService);
  private readonly workspaceApi = inject(WorkspaceApiService);
  private readonly state = signal<WorkspaceState>({
    workspaces: [],
    loading: false,
    loaded: false,
    error: null
  });
  readonly workspaces = computed(() => this.state().workspaces);
  readonly isLoading = computed(() => this.state().loading);
  readonly isLoaded = computed(() => this.state().loaded);
  readonly currentError = computed(() => this.state().error);
  readonly workspaceNames = computed(() => 
    this.state().workspaces.map(ws => ws.name)
  );

  loadWorkspaces(force = false): void {
    if (this.state().loading) return;
    if (this.state().loaded && !force) return;
    if (!this.authStore.isAuthenticated()) {
      this.updateState({
        loading: false,
        loaded: true,
        error: 'Unauthorized'
      });
      return;
    }

    this.updateState({ loading: true, error: null });

    this.workspaceApi.getWorkspaces().subscribe({
      next: (response: any) => {
        const payload = response?.data as Workspace[] | { items?: Workspace[] } | undefined;
        let workspaces: Workspace[] = [];

        if (Array.isArray(payload)) {
          workspaces = payload;
        } else if (payload && typeof payload === 'object' && 'items' in payload) {
          workspaces = payload.items ?? [];
        }

        this.updateState({
          workspaces,
          loading: false,
          loaded: true,
          error: null
        });
      },
      error: (error: any) => {
        this.updateState({
          loading: false,
          loaded: true,
          error: error?.message ?? 'Failed to load workspaces'
        });
      }
    });
  }

  private updateState(partial: Partial<WorkspaceState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}
import { Injectable, inject, signal, computed } from '@angular/core';
import { WorkspaceApiService } from './workspace-api.service';
import { Workspace, WorkspaceRole } from '../../../core/models/workspace.model';
import { AuthStoreService } from '../../auth/data-access/auth-store.service';
import { PermissionService } from '../../../core/services/permission.service';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceStoreService {
  private readonly authStore = inject(AuthStoreService);
  private readonly workspaceApi = inject(WorkspaceApiService);
  private readonly permissionService = inject(PermissionService);

  private readonly state = signal<WorkspaceState>({
    workspaces: [],
    activeWorkspaceId: null,
    loading: false,
    loaded: false,
    error: null,
  });

  readonly workspaces = computed(() => this.state().workspaces);
  readonly activeWorkspace = computed(
    () => this.state().workspaces.find((w) => w.id === this.state().activeWorkspaceId) || null,
  );
  readonly isLoading = computed(() => this.state().loading);
  readonly isLoaded = computed(() => this.state().loaded);

  loadWorkspaces(force = false): void {
    if (this.state().loading) return;
    if (this.state().loaded && !force) return;
    if (!this.authStore.isAuthenticated()) return;

    this.updateState({ loading: true, error: null });

    this.workspaceApi.getMeContext().subscribe({
      next: (response: any) => {
        const userWorkspaces = response?.data?.workspaces || [];

        const mappedWorkspaces: Workspace[] = userWorkspaces.map((ws: any) => ({
          id: ws.id,
          name: ws.name,
          slug: ws.name.toLowerCase().replace(/\s+/g, '-'),
          description: '',
          currentUserRole: ws.role,
        }));

        this.updateState({
          workspaces: mappedWorkspaces,
          loading: false,
          loaded: true,
          error: null,
        });
      },
      error: (error: any) => {
        this.updateState({
          loading: false,
          loaded: true,
          error: error?.message || 'Failed to load workspaces',
        });
      },
    });
  }

  setActiveWorkspace(workspaceId: string | null): void {
    this.updateState({ activeWorkspaceId: workspaceId });

    if (workspaceId) {
      const selectedWs = this.activeWorkspace();
      if (selectedWs && selectedWs.currentUserRole) {
        this.permissionService.setRole(selectedWs.currentUserRole.toUpperCase() as WorkspaceRole);
      }
    } else {
      this.permissionService.setRole(null);
    }
  }

  private updateState(partial: Partial<WorkspaceState>): void {
    this.state.update((current) => ({ ...current, ...partial }));
  }
}

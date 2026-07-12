import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { WorkspaceApiService } from './workspace-api.service';
import { Workspace, WorkspaceRole } from '../../../core/models/workspace.model';
import { AuthStoreService } from '../../auth/data-access/auth-store.service';
import { PermissionService } from '../../../core/services/permission.service';

type WorkspaceState = {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
};

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,
  isLoaded: false,
  error: null,
};

export const WorkspaceStoreService = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ workspaces, activeWorkspaceId }) => ({
    activeWorkspace: computed(() => workspaces().find((w) => w.id === activeWorkspaceId()) || null),
  })),

  withMethods(
    (
      store,
      authStore = inject(AuthStoreService),
      workspaceApi = inject(WorkspaceApiService),
      permissionService = inject(PermissionService),
    ) => ({
      createWorkspace(name: string, slug: string, description: string): void {
        patchState(store, { isLoading: true, error: null });

        workspaceApi.createWorkspace(name, slug, description).subscribe({
          next: (response: any) => {
            const newWorkspace = response?.data;
            if (newWorkspace) {
              const mappedWorkspace: Workspace = {
                id: newWorkspace._id,
                name: newWorkspace.name,
                slug: newWorkspace.name.toLowerCase().replace(/\s+/g, '-'),
                description: '',
                currentUserRole: newWorkspace.role,
              };

              patchState(store, {
                workspaces: [...store.workspaces(), mappedWorkspace],
                isLoading: false,
                error: null,
              });
            }
          },
          error: (error: any) => {
            patchState(store, {
              isLoading: false,
              error: error?.message || 'Failed to create workspace',
            });
          },
        });
      },
      updateWorkspace(workspaceId: string, data: Partial<Workspace>): void {
        patchState(store, { isLoading: true, error: null });

        workspaceApi.updateWorkspace(workspaceId, data).subscribe({
          next: (response: any) => {
            const updatedWorkspace = response?.data;
            if (updatedWorkspace) {
              const mappedWorkspace: Workspace = {
                id: updatedWorkspace._id,
                name: updatedWorkspace.name,
                slug: updatedWorkspace.name.toLowerCase().replace(/\s+/g, '-'),
                description: '',
                currentUserRole: updatedWorkspace.role,
              };

              const updatedWorkspaces = store
                .workspaces()
                .map((ws) => (ws.id === workspaceId ? mappedWorkspace : ws));

              patchState(store, {
                workspaces: updatedWorkspaces,
                isLoading: false,
                error: null,
              });
            }
          },
          error: (error: any) => {
            patchState(store, {
              isLoading: false,
              error: error?.message || 'Failed to update workspace',
            });
          },
        });
      },
      loadWorkspaces(force = false): void {
        if (store.isLoading()) return;
        if (store.isLoaded() && !force) return;
        if (!authStore.isAuthenticated()) return;

        patchState(store, { isLoading: true, error: null });

        workspaceApi.getMeContext().subscribe({
          next: (response: any) => {
            const userWorkspaces = response?.data?.workspaces || [];

            const mappedWorkspaces: Workspace[] = userWorkspaces.map((ws: any) => ({
              id: ws.id,
              name: ws.name,
              slug: ws.name.toLowerCase().replace(/\s+/g, '-'),
              description: '',
              currentUserRole: ws.role,
            }));

            patchState(store, {
              workspaces: mappedWorkspaces,
              isLoading: false,
              isLoaded: true,
              error: null,
            });
          },
          error: (error: any) => {
            patchState(store, {
              isLoading: false,
              isLoaded: true,
              error: error?.message || 'Failed to load workspaces',
            });
          },
        });
      },

      setActiveWorkspace(workspaceId: string | null): void {
        patchState(store, { activeWorkspaceId: workspaceId });

        if (workspaceId) {
          const selectedWs = store.workspaces().find((w) => w.id === workspaceId);
          if (selectedWs && selectedWs.currentUserRole) {
            permissionService.setRole(selectedWs.currentUserRole.toUpperCase() as WorkspaceRole);
          }
        } else {
          permissionService.setRole(null);
        }
      },
    }),
  ),
);

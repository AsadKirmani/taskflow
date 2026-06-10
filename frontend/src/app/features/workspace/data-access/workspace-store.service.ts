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
    error: null
  });

  readonly workspaces = computed(() => this.state().workspaces);
  readonly activeWorkspace = computed(() => 
    this.state().workspaces.find(w => w.id === this.state().activeWorkspaceId) || null
  );
  readonly isLoading = computed(() => this.state().loading);
  readonly isLoaded = computed(() => this.state().loaded);

  loadWorkspaces(force = false): void {
    if (this.state().loading) return;
    if (this.state().loaded && !force) return;
    if (!this.authStore.isAuthenticated()) return;

    this.updateState({ loading: true, error: null });

    // 🚀 TERA NAYA /ME ENDPOINT CALL
    this.workspaceApi.getMeContext().subscribe({
      next: (response: any) => {
        // 🔥 Tumhare exact JSON structure se data nikalna
        const userWorkspaces = response?.data?.workspaces || [];

        // Backend ke fields (id, name, role) ko Frontend model mein perfectly map karna
        const mappedWorkspaces: Workspace[] = userWorkspaces.map((ws: any) => ({
          id: ws.id,                           // Seedha id map ho gaya
          name: ws.name,                       // Seedha name map ho gaya
          slug: ws.name.toLowerCase().replace(/\s+/g, '-'), // UI routing/display ke liye
          description: '', 
          currentUserRole: ws.role             // YAHAN ROLE MAP HO GAYA ('OWNER')
        }));

        this.updateState({
          workspaces: mappedWorkspaces,
          loading: false,
          loaded: true,
          error: null
        });
      },
      error: (error: any) => {
        this.updateState({ 
          loading: false, 
          loaded: true, 
          error: error?.message || 'Failed to load workspaces' 
        });
      }
    });
  }

  // 🔥 Sidebar isko call karega
  setActiveWorkspace(workspaceId: string | null): void {
    this.updateState({ activeWorkspaceId: workspaceId });

    if (workspaceId) {
      const selectedWs = this.activeWorkspace();
      if (selectedWs && selectedWs.currentUserRole) {
        // 'OWNER' pehle se hi uppercase hai, par safety ke liye toUpperCase() rakha hai
        this.permissionService.setRole(selectedWs.currentUserRole.toUpperCase() as WorkspaceRole);
      }
    } else {
      this.permissionService.setRole(null); // Koi workspace select nahi, toh permissions bhi reset kar do
    }
  }

  private updateState(partial: Partial<WorkspaceState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}
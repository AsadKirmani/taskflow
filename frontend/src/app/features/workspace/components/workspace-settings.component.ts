import { Component, inject, signal } from '@angular/core';
import { WorkspaceStoreService } from '../../workspace/data-access/workspace-store.service';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workspace-settings',
  standalone: true,
  imports: [...APP_ICONS],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <h2 class="text-2xl font-bold text-base-content mb-6">Workspace Settings</h2>

      <div class="bg-base-100 rounded-box border border-base-300 shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4 text-base-content">General Details</h3>
        
        <div class="form-control w-full mb-4">
          <label class="label"><span class="label-text font-medium">Workspace Name</span></label>
          <input 
            type="text" 
            [value]="workspaceStore.activeWorkspace()?.name" 
            class="input input-bordered w-full focus:input-primary" 
          />
        </div>

        <div class="form-control w-full mb-6">
          <label class="label"><span class="label-text font-medium">Workspace Short Name (URL)</span></label>
          <div class="flex items-center gap-2">
            <span class="text-base-content/50 bg-base-200 px-3 py-3 rounded-l-md border border-base-300 border-r-0">app.taskflow.com/w/</span>
            <input 
              type="text" 
              disabled
              [value]="workspaceStore.activeWorkspace()?.slug" 
              class="input input-bordered w-full rounded-l-none bg-base-200/50 cursor-not-allowed" 
            />
          </div>
        </div>

        <button class="btn btn-primary">Save Changes</button>
      </div>

      <div class="bg-red-50/50 dark:bg-red-950/20 rounded-box border border-error/30 p-6">
        <h3 class="text-lg font-semibold text-error mb-2">Danger Zone</h3>
        <p class="text-sm text-base-content/70 mb-4">
          Deleting a workspace is irreversible. All boards, columns, and tasks inside this workspace will be permanently deleted.
        </p>
        <button class="btn btn-error btn-outline">Delete Workspace</button>
      </div>
    </div>
  `
})
export class WorkspaceSettingsComponent {
  workspaceStore = inject(WorkspaceStoreService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const wId = params.get('workspaceId');
      if (wId) {
        this.workspaceStore.setActiveWorkspace(wId);
      }
    });
  }
}
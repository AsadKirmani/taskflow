import { Component, inject, signal, effect, untracked, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiInputComponent } from '../../../ui/components/ui-input.component';
import { WorkspaceStoreService } from '../../workspace/data-access/workspace-store.service';

@Component({
  selector: 'app-workspace-settings',
  standalone: true,
  imports: [...APP_ICONS, UiButtonComponent, UiInputComponent, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <h2 class="text-2xl font-bold text-base-content mb-6">Workspace Settings</h2>

      <div class="bg-base-100 rounded-box border border-base-300 shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4 text-base-content">General Details</h3>

        <div class="form-control w-full mb-4">
          <ui-input
            label="Workspace Name"
            placeholder="Enter workspace name"
            type="text"
            [ngModel]="workspaceName()"
            (ngModelChange)="workspaceName.set($event)"
          ></ui-input>
        </div>

        <div class="form-control w-full mb-6">
          <label class="label"
            ><span class="label-text font-medium text-base-content/80"
              >Workspace Short Name (URL)</span
            ></label
          >
          <div class="flex items-center gap-2">
            <span
              class="text-base-content/50 bg-base-200 px-3 py-3 rounded-l-md border border-base-300 border-r-0"
              >app.taskflow.com/w/</span
            >
            <input
              type="text"
              disabled
              [value]="workspaceStore.activeWorkspace()?.slug || ''"
              class="input input-bordered w-full rounded-l-none bg-base-200/50 cursor-not-allowed text-base-content/70"
            />
          </div>
        </div>

        <ui-button variant="primary" (click)="saveChanges()" loadingText="Saving..." [loading]="isSaving()">Save Changes</ui-button>
      </div>

      <div class="bg-error/10 rounded-box border border-error/30 p-6">
        <h3 class="text-lg font-semibold text-error mb-2">Danger Zone</h3>
        <p class="text-sm text-base-content/70 mb-4">
          Deleting a workspace is irreversible. All boards, columns, and tasks inside this workspace
          will be permanently deleted.
        </p>
        <ui-button variant="danger">Delete Workspace</ui-button>
      </div>
    </div>
  `,
})
export class WorkspaceSettingsComponent implements OnInit {
  workspaceStore = inject(WorkspaceStoreService);
  private route = inject(ActivatedRoute);

  workspaceName = signal<string>('');
  private isInitialized = false;
  isSaving = signal(false);

  constructor() {
    effect(
      () => {
        const activeWs = this.workspaceStore.activeWorkspace();
        if (activeWs) {
          untracked(() => {
            if (!this.isInitialized) {
              this.workspaceName.set(activeWs.name);
              this.isInitialized = true;
            }
          });
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const wId = params.get('workspaceId');
      if (wId) {
        this.workspaceStore.setActiveWorkspace(wId);
      }
    });
  }

  saveChanges() {
    const activeWsId = this.workspaceStore.activeWorkspace()?.id;
    if (activeWsId && this.workspaceName().trim()) {
      this.isSaving.set(true);
      this.workspaceStore.updateWorkspace(activeWsId, { name: this.workspaceName() });  
    }
  }
}

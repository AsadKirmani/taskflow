import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceStoreService } from '../data-access/workspace-store.service';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiInputComponent } from '../../../ui/components/ui-input.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';

@Component({
  selector: 'app-create-workspace-modal',
  standalone: true,
  imports: [FormsModule, UiButtonComponent, UiInputComponent, ...APP_ICONS],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-10 p-2"
      >
        <div class="bg-base-100 rounded-lg shadow-xl p-6 w-full max-w-md border border-base-300">
          <div class="flex items-start justify-between gap-4 mb-4">
            <h2 class="text-2xl font-semibold text-base-content">Create New Workspace</h2>
            <ui-button variant="ghost" size="icon" (click)="close()">
              <svg lucideX></svg>
            </ui-button>
          </div>
          <p class="text-sm text-base-content/60 mb-6">
            Workspaces help you organize boards and team members in one place.
          </p>

          <div class="space-y-4">
            <div class="form-control w-full">
              <ui-input
                type="text"
                label="Workspace Name"
                placeholder="e.g. Marketing Team, Frontend Guild"
                [ngModel]="workspaceName()"
                (ngModelChange)="workspaceName.set($event)"
                (keyup.enter)="create()"
              >
              </ui-input>
            </div>
            <div class="form-control w-full">
              <label class="label mb-2 text-base-content/80">Workspace URL</label>
              <div class="flex items-center gap-2">
                <span
                  class="text-base-content/50 bg-base-200 px-3 py-3 rounded-l-md border border-base-300 border-r-0 text-sm"
                >
                  app.taskflow.com/w/
                </span>
                <input
                  type="text"
                  disabled
                  [value]="generatedSlug()"
                  placeholder="marketing-team"
                  class="input input-bordered w-full rounded-l-none bg-base-200/50 cursor-not-allowed text-base-content/70"
                />
              </div>
            </div>

            <div class="form-control w-full flex flex-col">
              <label class="label mb-2 text-base-content/80">Description (Optional)</label>
              <textarea
                class="textarea textarea-bordered h-20 focus:textarea-primary bg-base-100 resize-none text-base-content/80"
                placeholder="What is this workspace for?"
                [ngModel]="description()"
                (ngModelChange)="description.set($event)"
              ></textarea>
            </div>
          </div>

          <div class="modal-action mt-8 border-t border-base-300 pt-4">
            <ui-button variant="ghost" (click)="close()">Cancel</ui-button>
            <ui-button
              variant="primary"
              (click)="create()"
              [disabled]="!workspaceName().trim() || isLoading()"
            >
              @if (isLoading()) {
                <span class="loading loading-spinner loading-sm mr-2"></span> Creating...
              } @else {
                Create Workspace
              }
            </ui-button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="close()"></div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateWorkspaceModalComponent {
  workspaceStore = inject(WorkspaceStoreService);

  isOpen = signal(false);
  isLoading = signal(false);

  workspaceName = signal('');
  description = signal('');
  generatedSlug = computed(() => {
    return this.workspaceName()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  });

  open() {
    this.workspaceName.set('');
    this.description.set('');
    this.isOpen.set(true);
  }

  close() {
    if (this.isLoading()) return;
    this.isOpen.set(false);
  }

  async create() {
    if (!this.workspaceName().trim() || this.isLoading()) return;
    this.isLoading.set(true);
    try {
      this.workspaceStore.createWorkspace(
        this.workspaceName(),
        this.generatedSlug(),
        this.description(),
      );

      this.isLoading.set(false);
      this.close();
    } catch (error) {
      console.error('Failed to create workspace', error);
      this.isLoading.set(false);
    }
  }
}

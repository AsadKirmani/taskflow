import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardStore } from '../data-access/board-store.service';
import { Workspace } from '../../../core/models/workspace.model';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiSelectComponent, SelectOption } from '../../../ui/components/ui-select.component';

@Component({
  selector: 'app-board-modal',
  standalone: true,
  imports: [FormsModule, UiButtonComponent, UiSelectComponent, ...APP_ICONS],
  template: `
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-10 p-2"
      (mousedown)="onBackdropClick($event)"
    >
      <div class="bg-base-100 rounded-lg shadow-xl p-6 w-full max-w-md border border-base-300">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h2 class="text-2xl font-semibold text-base-content">Create New Board</h2>
          <ui-button
            variant="ghost"
            size="icon"
            (click)="close()"
          >
            <svg lucideX></svg>
          </ui-button>
        </div>

        <form (submit)="createBoard($event)">
          <div class="mb-4">
            <label for="boardName" class="block text-base-content mb-2 font-medium text-sm">Board Name</label>
            <input
              type="text"
              id="boardName"
              [(ngModel)]="boardDraft.name"
              name="boardName"
              class="w-full px-3 py-2 border border-base-300 text-base-content bg-base-100 rounded-field focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Enter board name"
            />
          </div>

          <div class="mb-4">
            <ui-select
              name="workspaceId"
              [label]="'Workspace'"
              [placeholder]="'Select workspace'"
              [options]="workspaceOptions()"
              [(ngModel)]="boardDraft.workspaceId"
              class="w-full text-base-content"
            ></ui-select>
          </div>

          <div class="mb-6">
            <ui-select
              name="visibility"
              [label]="'Visibility'"
              [placeholder]="'Select visibility'"
              [options]="visibilityOptions"
              [(ngModel)]="boardDraft.visibility"
              class="w-full text-base-content"
            ></ui-select>
          </div>

          <div class="mb-2">
            <ui-button
              variant="primary"
              size="lg"
              type="submit"
              [fullWidth]="true"
            >
              Create Board
            </ui-button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class BoardModalComponent {
  private readonly boardStore = inject(BoardStore);
  private readonly notificationService = inject(NotificationService);

  readonly selectedWorkspaceId = input<string>('');
  readonly selectedWorkspaceName = input<string>('');
  readonly availableWorkspaces = input<Pick<Workspace, 'id' | 'name'>[]>([]);
  
  readonly modalClosed = output<void>();

  readonly hasSelectedWorkspace = computed(() =>
    Boolean(this.selectedWorkspaceId() && this.selectedWorkspaceName()),
  );
  readonly workspaceOptions = computed<SelectOption[]>(() => {
    return this.availableWorkspaces().map(ws => ({
      label: ws.name,
      value: ws.id
    }));
  });

  readonly visibilityOptions: SelectOption[] = [
    { label: 'Private', value: 'private' },
    { label: 'Workspace', value: 'workspace' }
  ];

  readonly boardDraft = {
    name: '',
    workspaceId: '',
    visibility: 'private' as 'private' | 'workspace',
  };

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  createBoard(event?: Event): void {
    event?.preventDefault();

    const { name, workspaceId, visibility } = this.boardDraft;
    const trimmedName = name.trim();
    
    const resolvedWorkspaceId = workspaceId || this.selectedWorkspaceId();
    const resolvedWorkspaceName =
      this.selectedWorkspaceName() ||
      this.availableWorkspaces().find((workspace) => workspace.id === resolvedWorkspaceId)?.name ||
      '';

    if (!trimmedName) {
      this.notificationService.error('Board name is required');
      return;
    }

    if (!resolvedWorkspaceId || !resolvedWorkspaceName) {
      this.notificationService.error('Workspace is required');
      return;
    }

    this.boardStore.createBoard(
      trimmedName,
      resolvedWorkspaceName,
      resolvedWorkspaceId,
      visibility,
    );
    this.close();
  }

  close(): void {
    this.modalClosed.emit();
  }
}
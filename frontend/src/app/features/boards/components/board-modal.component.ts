import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardStoreService } from '../data-access/board-store.service';
import { Workspace } from '../../../core/models/workspace.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-board-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-10 p-2" (click)="close()">
      <div class="bg-white rounded-lg shadow p-6 w-full max-w-md border border-gray-300" (click)="$event.stopPropagation()">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h2 class="text-2xl font-semibold">Create New Board</h2>
          <button type="button" class="text-gray-500 hover:text-gray-700" (click)="close()">Close</button>
        </div>

        <form (submit)="createBoard($event)">
          <div class="mb-4">
            <label for="boardName" class="block text-gray-700 mb-2">Board Name</label>
            <input
              type="text"
              id="boardName"
              [(ngModel)]="boardDraft.name"
              name="boardName"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter board name"
            >
          </div>

          <div class="mb-4">
            <label for="workspace" class="block text-gray-700 mb-2">Workspace</label>
            <ng-container *ngIf="hasSelectedWorkspace(); else workspacePicker">
              <input
                id="workspace"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                [value]="selectedWorkspaceName()"
                readonly
              >
            </ng-container>
            <ng-template #workspacePicker>
              <select
                [(ngModel)]="boardDraft.workspaceId"
                name="workspaceId"
                id="workspace"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select workspace</option>
                <option *ngFor="let workspace of availableWorkspaces()" [value]="workspace.id">
                  {{ workspace.name }}
                </option>
              </select>
            </ng-template>
          </div>

          <div class="mb-4">
            <label for="visibility" class="block text-gray-700 mb-2">Visibility</label>
            <select
              [(ngModel)]="boardDraft.visibility"
              name="visibility"
              id="visibility"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="private">Private</option>
              <option value="workspace">Workspace</option>
            </select>
          </div>

          <div class="mb-2">
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BoardModalComponent {
  private readonly boardStore = inject(BoardStoreService);
  private readonly notificationService = inject(NotificationService);

  readonly selectedWorkspaceId = input<string>('');
  readonly  selectedWorkspaceName = input<string>('');
  readonly availableWorkspaces = input<Pick<Workspace, 'id' | 'name'>[]>([]);
  @Output() readonly modalClosed = new EventEmitter<void>();
  

  readonly hasSelectedWorkspace = computed(() => Boolean(this.selectedWorkspaceId() && this.selectedWorkspaceName()));

  readonly boardDraft = {
    name: '',
    workspaceId: '',
    visibility: 'private' as 'private' | 'workspace'
  };

  createBoard(event?: Event): void {
    event?.preventDefault();

    const { name, workspaceId, visibility } = this.boardDraft;
    const trimmedName = name.trim();
    const resolvedWorkspaceId = this.selectedWorkspaceId() || workspaceId;
    const resolvedWorkspaceName =
      this.selectedWorkspaceName() ||
      this.availableWorkspaces().find(workspace => workspace.id === resolvedWorkspaceId)?.name ||
      '';

    if (!trimmedName) {
      this.notificationService.error('Board name is required');
      return;
    }

    if (!resolvedWorkspaceId || !resolvedWorkspaceName) {
      this.notificationService.error('Workspace is required');
      return;
    }

    this.boardStore.createBoard(trimmedName, resolvedWorkspaceName, resolvedWorkspaceId, visibility);
    this.close();
  }

  close(): void {
    this.modalClosed.emit();
    console.log('Board creation modal closed');
  }
}

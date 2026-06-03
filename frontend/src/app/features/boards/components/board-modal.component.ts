import { Component, inject, signal } from "@angular/core";
import { form, FormField } from "@angular/forms/signals";
import { WorkspaceStoreService } from "../../workspace/data-access/workspace-store.service";

import { CommonModule } from "@angular/common";
import { BoardStoreService } from "../data-access/board-store.service";

@Component({
    selector: 'app-board-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-10 p-2">
      <div class="bg-white rounded-lg shadow p-6 w-full max-w-md border border-gray-300">
        <h2 class="text-2xl font-semibold mb-4">Create New Board</h2>
        <form>
          <div class="mb-4">
            <label for="boardName" class="block text-gray-700 mb-2">Board Name</label>
            <input type="text" id="boardName" [formField]="boardForm.name" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter board name">
          </div>
            <div class="mb-4">
            <label for="workspace" class="block text-gray-700 mb-2">Workspace</label>
            <select [formField]="boardForm.workspaceName" id="workspace" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter workspace name">
                <option value="">Select workspace</option>
                <option *ngFor="let workspace of workspaceStore.workspaceName$ | async" [value]="workspace">{{ workspace }}</option>
            </select>
            </div>
            <div class="mb-4">
            <label for="visibility" class="block text-gray-700 mb-2">Visibility</label>
            <select [formField]="boardForm.visibility" id="visibility" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Select visibility">
                <option value="">Select visibility</option>
                <option value="private">Private</option>
                <option value="workspace">Workspace</option>
                <option value="public">Public</option>
            </select>
          </div>
            <div class="mb-2">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full disabled:opacity-50" (click)="createBoard(boardName, workspaceName, visibility, workspaceId)">Create</button>
          </div>
        </form>
      </div>
    </div>
    `
})
export class BoardModalComponent {
    workspaceStore = inject(WorkspaceStoreService);
    boardStore = inject(BoardStoreService);
    toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'board';
  }
  createBoard(name: string, workspaceName: string, visibility: string, workspaceId: string): void {
    const newBoard = {
      name: name,
      workspaceId: workspaceId,
      workspaceName: workspaceName,
      visibility: visibility
    };
    this.boardStore.createBoard(newBoard.name, newBoard.workspaceName || '', newBoard.workspaceId || '', newBoard.visibility as 'private' | 'workspace');
  }
  boardModel = signal({
    name: '',
    workspaceName: '',
    visibility: 'private'
  });
 boardForm = form(this.boardModel);
}
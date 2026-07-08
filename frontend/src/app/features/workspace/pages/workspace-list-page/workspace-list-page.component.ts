import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceStoreService } from '../../data-access/workspace-store.service';

@Component({
  selector: 'app-workspace-list-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Workspaces</h1>

      @if (workspaceStore.isLoading()) {
        <p class="text-gray-500">Loading workspaces...</p>
      }

      @if (!workspaceStore.isLoading() && workspaceStore.workspaces().length > 0) {
        <ul class="space-y-2">
          @for (workspace of workspaceStore.workspaces(); track workspace.id) {
            <li class="bg-white p-3 rounded shadow-sm border border-gray-100">
              <a
                class="text-blue-600 hover:underline font-medium"
                [routerLink]="[
                  '/workspaces',
                  workspace.id,
                  workspace.slug || toSlug(workspace.name),
                ]"
              >
                {{ workspace.name }}
              </a>
            </li>
          }
        </ul>
      }

      @if (!workspaceStore.isLoading() && workspaceStore.workspaces().length === 0) {
        <p class="text-gray-500">No workspaces found.</p>
      }

      <p class="text-xs text-gray-400 mt-6">Workspace list placeholder page.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceListPageComponent implements OnInit {
  protected readonly workspaceStore = inject(WorkspaceStoreService);

  ngOnInit(): void {
    this.workspaceStore.loadWorkspaces();
  }

  protected toSlug(value: string): string {
    return (
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'workspace'
    );
  }
}

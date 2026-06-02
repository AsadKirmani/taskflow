import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceStoreService } from '../../data-access/workspace-store.service';

@Component({
  selector: 'app-workspace-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section *ngIf="state$ | async as state">
      <h1>Workspaces</h1>

      <p *ngIf="state.loading">Loading workspaces...</p>

      <ul *ngIf="!state.loading && state.workspaces.length > 0" class="space-y-2">
        <li *ngFor="let workspace of state.workspaces">
          <a
            class="text-blue-600 hover:underline"
            [routerLink]="['/workspaces', workspace.id, workspace.slug || toSlug(workspace.name)]"
          >
            {{ workspace.name }}
          </a>
        </li>
      </ul>

      <p *ngIf="!state.loading && state.workspaces.length === 0">No workspaces found.</p>
      <p *ngIf="state.error">{{ state.error }}</p>

      <p>Workspace list placeholder page.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceListPageComponent {
  private readonly workspaceStore = inject(WorkspaceStoreService);
  readonly state$ = this.workspaceStore.state$;

  constructor() {
    this.loadWorkspaces();
  }

  private loadWorkspaces(): void {
    this.workspaceStore.loadWorkspaces();
  }

  protected toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workspace';
  }
}
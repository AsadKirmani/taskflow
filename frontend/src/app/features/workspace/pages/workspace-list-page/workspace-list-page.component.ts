import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceStoreService } from '../../data-access/workspace-store.service';

@Component({
  selector: 'app-workspace-list-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section *ngIf="state$ | async as state">
      <h1>Workspaces</h1>

      <p *ngIf="state.loading">Loading workspaces...</p>

      <ul *ngIf="!state.loading && state.workspaces.length > 0">
        <li *ngFor="let workspace of state.workspaces">{{ workspace.name }}</li>
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
}
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WorkspaceStoreService } from '../../../features/workspace/data-access/workspace-store.service';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Output() navigate = new EventEmitter<void>();
  openWorkspaceId: string | null = null;
  private readonly workspaceStoreService = inject(WorkspaceStoreService);

  constructor() {
    this.workspaceStoreService.loadWorkspaces();
  }

  readonly workspaces$ = this.workspaceStoreService.state$.pipe(
    map(state => state.workspaces)
  );
  
  onNavigate() {
    this.navigate.emit();
  }

  toggleWorkspace(workspaceId: string): void {
    this.openWorkspaceId = this.openWorkspaceId === workspaceId ? null : workspaceId;
  }

  isWorkspaceOpen(workspaceId: string): boolean {
    return this.openWorkspaceId === workspaceId;
  }
}

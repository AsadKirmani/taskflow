import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnInit, Output, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { WorkspaceStoreService } from '../../../features/workspace/data-access/workspace-store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  @Output() navigate = new EventEmitter<void>();
  isCollapsed = input<boolean>(false);

  protected readonly workspaceStore = inject(WorkspaceStoreService);
  
  openWorkspaceId: string | null = null;

  ngOnInit(): void {

    this.workspaceStore.loadWorkspaces();
  }
  
  onNavigate(): void {
    this.navigate.emit();
  }

  toggleWorkspace(workspaceId: string): void {
    this.openWorkspaceId = this.openWorkspaceId === workspaceId ? null : workspaceId;
  }

  isWorkspaceOpen(workspaceId: string): boolean {
    return this.openWorkspaceId === workspaceId;
  }
}
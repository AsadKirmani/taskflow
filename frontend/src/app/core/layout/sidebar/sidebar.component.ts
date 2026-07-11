import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { WorkspaceStoreService } from '../../../features/workspace/data-access/workspace-store.service';
import { APP_ICONS } from '../../icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UiButtonComponent, ...APP_ICONS],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  navigate = output<void>();
  toggleSidebar = output<void>();
  readonly isCollapsed = input<boolean>(false);
  
  protected readonly workspaceStore = inject(WorkspaceStoreService);
  private readonly openWorkspaceId = signal<string | null>(null);

  readonly navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Boards', route: '/boards', icon: 'boards' },
    { label: 'Activity', route: '/activity', icon: 'activity' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ] as const;

  readonly workspaceLinks = [
    { label: 'Boards', path: 'boards' },
    { label: 'Activity', path: 'activity' },
    { label: 'Settings', path: 'settings' },
  ] as const;

  constructor() {
    this.workspaceStore.loadWorkspaces();
  }

  toggleWorkspace(workspaceId: string): void {
    if (this.isCollapsed()) return; 
    this.openWorkspaceId.update((current) => (current === workspaceId ? null : workspaceId));
  }

  isWorkspaceOpen(workspaceId: string): boolean {
    return this.openWorkspaceId() === workspaceId;
  }
}
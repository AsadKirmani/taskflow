import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  input,
  signal
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { WorkspaceStoreService } from '../../../features/workspace/data-access/workspace-store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {

  @Output()
  navigate = new EventEmitter<void>();

  readonly isCollapsed =
    input<boolean>(false);

  protected readonly workspaceStore =
    inject(WorkspaceStoreService);

  private readonly openWorkspaceId =
    signal<string | null>(null);

  readonly navItems = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Boards',
      route: '/boards',
      icon: 'boards'
    },
    {
      label: 'Activity',
      route: '/activity',
      icon: 'activity'
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: 'settings'
    }
  ] as const;

  readonly workspaceLinks = [
    {
      label: 'Boards',
      route: 'workspaces/:workspaceId/boards',
      path: 'boards'
    },
    {
      label: 'Activity',
      route: 'workspaces/:workspaceId/activity',
      path: 'activity'
    },
    {
      label: 'Settings',
      route: 'workspaces/:workspaceId/settings',
      path: 'settings'
    }
  ] as const;

  constructor() {
    this.workspaceStore.loadWorkspaces();
  }

  toggleWorkspace(
    workspaceId: string
  ): void {

    this.openWorkspaceId.update(
      current =>
        current === workspaceId
          ? null
          : workspaceId
    );
  }

  isWorkspaceOpen(
    workspaceId: string
  ): boolean {

    return (
      this.openWorkspaceId() ===
      workspaceId
    );
  }

  selectWorkspace(
    workspaceId: string
  ): void {

    this.workspaceStore
      .setActiveWorkspace(
        workspaceId
      );

    this.navigate.emit();
  }

  onNavigate(): void {
    this.navigate.emit();
  }
}
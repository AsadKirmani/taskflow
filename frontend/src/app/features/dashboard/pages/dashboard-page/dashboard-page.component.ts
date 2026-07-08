import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import {
  ActivityItem,
  ActivityRef,
  formatActivityAction,
} from '../../../activity/models/activity.model';
import { DashboardStore } from '../../data-access/dashboard-store.service';
import { UiPageHeaderComponent } from '../../../../ui/components/layout/ui-page-header.component';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';
import { UiEmptyStateComponent } from '../../../../ui/components/ui-empty-state.component';
import { UiSkeletonComponent } from '../../../../ui/components/ui-skeleton.component';
import { UiPageBodyComponent } from '../../../../ui/components/layout/ui-page-body.component';
import { UiPanelComponent } from '../../../../ui/components/layout/ui-panel.component';
import { UiStatCardComponent } from '../../../../ui/components/layout/ui-stat-card.component';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { WorkspaceStoreService } from '../../../workspace/data-access/workspace-store.service';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { DatePipe, TitleCasePipe } from '@angular/common';

export interface DashboardTaskRow {
  id: string;
  boardId: string;
  boardName: string;
  title: string;
  dueDate: string | null;
  priority: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    RouterLink,
    UiPageHeaderComponent,
    UiButtonComponent,
    UiEmptyStateComponent,
    UiSkeletonComponent,
    UiPageBodyComponent,
    UiPanelComponent,
    UiStatCardComponent,
    DatePipe,
    TitleCasePipe,
    ...APP_ICONS,
  ],
  
  templateUrl: './dashboard-page.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  readonly store = inject(DashboardStore);
  readonly authStore = inject(AuthStoreService);
  readonly workspaceStore = inject(WorkspaceStoreService);

  constructor() {
    effect(() => {
      const isAuthLoading = this.authStore.isLoading();
      const isWorkspaceLoading = this.workspaceStore.isLoading();

      if (isAuthLoading || isWorkspaceLoading) {
        return;
      }

      const user = this.authStore.currentUser();
      if (!user) return;

      let targetWorkspaceId = this.workspaceStore.activeWorkspace()?.id;

      if (!targetWorkspaceId) {
        const allWorkspaces = this.workspaceStore.workspaces();

        if (allWorkspaces && allWorkspaces.length > 0) {
          targetWorkspaceId = allWorkspaces[0].id;

          untracked(() => this.workspaceStore.setActiveWorkspace(allWorkspaces[0].id));
        }
      }

      if (targetWorkspaceId) {
        this.store.loadDashboardData(targetWorkspaceId, user.id);
      } else {
        this.store.setEmptyWorkspaceState();
      }
    });
  }

  readonly priorityClassMap: Record<string, string> = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  };

  getTaskStatusClass(task: DashboardTaskRow): string {
    return task.isCompleted ? 'text-green-500' : 'text-blue-500';
  }

  getPriorityClass(priority: string): string {
    return this.priorityClassMap[priority.toLowerCase()] ?? 'text-gray-500';
  }

  getBoardRoute(boardId: string, boardName: string): string[] {
    return ['/boards', boardId, this.toSlug(boardName || 'board')];
  }

  getTaskQueryParams(task: DashboardTaskRow): Record<string, string> {
    return {
      taskId: task.id,
      taskTitle: this.toSlug(task.title),
    };
  }

  describeActivity(item: ActivityItem): string {
    const actor = this.getRef(item.userId)?.name || 'Someone';
    const task = this.getRef(item.taskId)?.title;
    const board = this.getRef(item.boardId)?.name;
    const workspace = this.getRef(item.workspaceId)?.name;
    const action = formatActivityAction(item.actionType);

    if (task) {
      return `${actor} ${action} "${task}"`;
    }

    if (board) {
      return `${actor} ${action} on board "${board}"`;
    }

    if (workspace) {
      return `${actor} ${action} in workspace "${workspace}"`;
    }
    return `${actor} ${action}`;
  }

  private getRef(value: string | ActivityRef | null | undefined): ActivityRef | null {
    if (!value || typeof value === 'string') {
      return null;
    }
    return value;
  }

  private toSlug(value: string): string {
    return (
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'item'
    );
  }
}

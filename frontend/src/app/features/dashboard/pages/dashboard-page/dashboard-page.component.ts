import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { ActivityItem, ActivityRef, formatActivityAction } from '../../../activity/models/activity.model';
import { UiPageLayoutComponent } from '../../../../ui/components/layout/ui-page-layout.component';
import { DashboardStore } from '../../data-access/dashboard-store.service';
import { UiPageContentComponent } from '../../../../ui/components/layout/ui-page-content.component';
import { UiPageHeaderComponent } from '../../../../ui/components/layout/ui-page-header.component';
import { UiStackComponent } from '../../../../ui/components/layout/ui-stack.component';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';
import { UiBadgeComponent } from '../../../../ui/components/ui-badge.component';
import { UiCardComponent } from '../../../../ui/components/ui-card.component';
import { UiEmptyStateComponent } from '../../../../ui/components/ui-empty-state.component';
import { UiSkeletonComponent } from '../../../../ui/components/ui-skeleton.component';
import { UiPageBodyComponent } from '../../../../ui/components/layout/ui-page-body.component';
import { UiPanelComponent } from '../../../../ui/components/layout/ui-panel.component'
import { UiStatCardComponent } from '../../../../ui/components/layout/ui-stat-card.component';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { WorkspaceStoreService } from '../../../workspace/data-access/workspace-store.service';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';

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
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    RouterLink, 
    UiPageLayoutComponent, 
    UiPageHeaderComponent, 
    UiPageContentComponent, 
    UiButtonComponent, 
    UiStackComponent, 
    UiBadgeComponent, 
    UiCardComponent, 
    UiEmptyStateComponent, 
    UiSkeletonComponent, 
    UiPageBodyComponent, 
    UiPanelComponent,
    UiStatCardComponent,
    ...APP_ICONS
  ],
  templateUrl: './dashboard-page.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent{
  
  // 🚀 Sirf aur sirf Store inject kiya hai
  readonly store = inject(DashboardStore);
  readonly authStore = inject(AuthStoreService);
  readonly workspaceStore = inject(WorkspaceStoreService);

 constructor() {
  effect(() => {
      // 1. App ki loading states track karo
      const isAuthLoading = this.authStore.isLoading();
      const isWorkspaceLoading = this.workspaceStore.isLoading();
      
      // 🚀 RACE CONDITION GUARD: Jab tak user aur workspaces load na ho jayein, wait karo!
      if (isAuthLoading || isWorkspaceLoading) {
        return; 
      }

      const user = this.authStore.currentUser();
      if (!user) return; // Agar user hi nahi hai toh wapas jao

      // 2. Workspace ID dhoondo
      let targetWorkspaceId = this.workspaceStore.activeWorkspace()?.id;

      // 🚀 SMART FALLBACK: Agar user ne koi workspace select nahi kiya, toh uske list ka pehla workspace utha lo
      if (!targetWorkspaceId) {
        const allWorkspaces = this.workspaceStore.workspaces(); // Assumed array of workspaces
        
        if (allWorkspaces && allWorkspaces.length > 0) {
          targetWorkspaceId = allWorkspaces[0].id;
          
          // Optional: Tujhe chahiye toh WorkspaceStore ka active workspace bhi set kar sakta hai bina extra API call ke
          untracked(() => this.workspaceStore.setActiveWorkspace(allWorkspaces[0].id)); 
        }
      }

      // 3. Agar workspace mil gaya, toh Dashboard fetch maro (userId bhi bhej do validation fix karne ke liye)
      if (targetWorkspaceId) {
        // userId pass kar rahe hain backend validation error fix karne ke liye
        this.store.loadDashboardData(targetWorkspaceId, user.id); 
      } else {
        // 🚀 EDGE CASE: Naya user jiska koi workspace nahi hai
        // Store mein ek action call kardo jo loading false kar de taaki infinite loader na dikhe
        this.store.setEmptyWorkspaceState(); 
      }
    });
}

  // --- UI Helpers (Strictly for styling and routing) ---

  readonly priorityClassMap: Record<string, string> = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    urgent: 'text-red-500'
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
      taskTitle: this.toSlug(task.title)
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
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  }
}
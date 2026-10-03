import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiAvatarComponent } from '../../../ui/components/ui-avatar.component';
import { RouterLink } from '@angular/router';
import { DashboardStore } from '../../../features/dashboard/data-access/dashboard-store.service';
import { WorkspaceStoreService } from '../../../features/workspace/data-access/workspace-store.service';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ActivityItem,
  ActivityRef,
  formatActivityAction,
} from '../../activity/models/activity.model';
import { UiAvatarStackComponent } from '../../../ui/components/ui-avatar-stack.component';


@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [UiButtonComponent, UiAvatarComponent, UiAvatarStackComponent, RouterLink, ...APP_ICONS, DatePipe, CommonModule],
  template: `
    <div class="min-h-full w-full bg-base-200/50 p-4 md:p-8">
      <div class="max-w-6xl mx-auto">
        <div class="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden mb-6">
          <div
            class="h-40 sm:h-52 bg-gradient-to-br from-primary/80 via-primary to-secondary relative"
          >
            <div
              class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
            ></div>
          </div>

          <div class="px-6 sm:px-10 pb-8">
            <div class="relative flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
              <div
                class="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-base-100 bg-base-200 shadow-xl overflow-hidden"
              >
                <ui-avatar
                  [name]="authStore.currentUser()?.name || 'User'"
                  [src]="authStore.currentUser()?.avatarUrl || ''"
                  size="full"
                ></ui-avatar>
              </div>

              <div class="flex gap-3 mb-2">
                <ui-button
                  variant="ghost"
                  class="hidden sm:flex border border-base-300 shadow-sm bg-base-100"
                >
                  <svg lucideShare class="w-4 h-4 mr-2"></svg> Share
                </ui-button>
                <ui-button variant="primary" routerLink="/settings" class="flex items-center gap-2">
                  <svg lucideSquarePen class="w-4 h-4 mr-2"></svg> Edit Profile
                </ui-button>
              </div>
            </div>
            <div>
              <h1 class="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight">
                {{ authStore.currentUser()?.name || 'Alex Developer' }}
              </h1>
              <p class="text-lg text-base-content/60 font-medium mt-1">Senior Frontend Engineer</p>
              <div
                class="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-base-content/70"
              >
                <span class="flex items-center gap-1.5"
                  ><svg lucideMapPin class="w-4 h-4"></svg> Pune, India</span
                >
                <span class="flex items-center gap-1.5"
                  ><svg lucideMail class="w-4 h-4"></svg>
                  {{ authStore.currentUser()?.email || 'alex@taskflow.com' }}</span
                >
                <span class="flex items-center gap-1.5"
                  ><svg lucideCalendar class="w-4 h-4"></svg> {{ authStore.currentUser()?.createdAt | date:'MMMM yyyy'}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6">
              <h3 class="font-bold text-base-content mb-3 flex items-center gap-2">
                <svg lucideUser class="w-4 h-4 text-primary"></svg> About
              </h3>
              <p class="text-sm text-base-content/70 leading-relaxed">
                Passionate about building intuitive user interfaces and solving complex frontend
                challenges. Always exploring new web technologies and design patterns.
              </p>
            </div>

            <div class="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6">
              <h3 class="font-bold text-base-content mb-4 flex items-center gap-2">
                <svg lucideBarChartNoAxesColumn class="w-4 h-4 text-primary"></svg> Workload Stats
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-base-content/70 flex items-center gap-2"
                    ><svg lucideCheckCircle class="w-4 h-4 text-success"></svg> Tasks
                    Completed</span
                  >
                  <span class="font-bold text-base-content">{{
                    dashboardStore.completedTasks()
                  }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-base-content/70 flex items-center gap-2"
                    ><svg lucideClock class="w-4 h-4 text-warning"></svg> In Progress</span
                  >
                  <span class="font-bold text-base-content"></span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-base-content/70 flex items-center gap-2"
                    ><svg lucideKanban class="w-4 h-4 text-info"></svg> Active Boards</span
                  >
                  <span class="font-bold text-base-content">{{
                    dashboardStore.activeBoards()
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <div class="flex gap-6 border-b border-base-300 px-2">
              <button
                (click)="activeTab.set('activity')"
                class="pb-3 text-sm font-semibold transition-colors relative"
                [class]="
                  activeTab() === 'activity'
                    ? 'text-primary'
                    : 'text-base-content/50 hover:text-base-content'
                "
              >
                Recent Activity
                @if (activeTab() === 'activity') {
                  <span
                    class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"
                  ></span>
                }
              </button>
              <button
                (click)="activeTab.set('workspaces')"
                class="pb-3 text-sm font-semibold transition-colors relative"
                [class]="
                  activeTab() === 'workspaces'
                    ? 'text-primary'
                    : 'text-base-content/50 hover:text-base-content'
                "
              >
                Workspaces & Teams
                @if (activeTab() === 'workspaces') {
                  <span
                    class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"
                  ></span>
                }
              </button>
            </div>

            @if (activeTab() === 'activity') {
              <div
                class="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 animate-in fade-in duration-300"
              >
                <ul class="space-y-6">
                  @for (
                    item of dashboardStore.recentActivities();
                    track item._id ?? item.id ?? item.createdAt
                  ) {
                    <li
                      class="flex items-start justify-between gap-4 p-4 hover:bg-base-200 transition-colors"
                    >
                      <div class="flex items-start gap-3 min-w-0">
                        <span
                          class="activity-icon bg-primary w-2 h-2 mt-1.5 rounded-full inline-block shrink-0 shadow-sm"
                        ></span>
                        <span class="truncate text-sm font-medium text-base-content">{{
                          describeActivity(item)
                        }}</span>
                      </div>
                      <span class="text-xs font-bold text-base-content/40 shrink-0 mt-0.5">{{
                        item.createdAt | date: 'short'
                      }}</span>
                    </li>
                  }
                </ul>
              </div>
            }

            @if (activeTab() === 'workspaces') {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
              @for (workspace of workspaceStore.workspaces(); track workspace.id) {
                  <div
                    class="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5 hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    <div
                      class="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold mb-4"
                    >
                      {{ workspace.name.charAt(0).toUpperCase() }}
                    </div>
                    <h4
                      class="font-bold text-base-content group-hover:text-primary transition-colors"
                    >
                      {{ workspace.name }}
                    </h4>
                    <p class="text-xs text-base-content/60 mt-1">{{workspace.boardsCount}} Boards • {{workspace.membersCount}} Members</p>
                    <ui-avatar-stack
                    [users]="[
                      { id: '1', name: 'Dev' },
                      { id: '2', name: 'Design' },
                    ]"
                    size="sm"
                  />
                    </div>
                    }
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  authStore = inject(AuthStoreService);
  dashboardStore = inject(DashboardStore);
  workspaceStore = inject(WorkspaceStoreService);
  activeTab = signal<'activity' | 'workspaces'>('activity');
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
}

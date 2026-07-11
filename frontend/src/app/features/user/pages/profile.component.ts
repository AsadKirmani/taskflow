import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiAvatarComponent } from '../../../ui/components/ui-avatar.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [UiButtonComponent, UiAvatarComponent, RouterLink, ...APP_ICONS],
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
                  ><svg lucideCalendar class="w-4 h-4"></svg> Joined March 2024</span
                >
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
                <svg lucideBarChart2 class="w-4 h-4 text-primary"></svg> Workload Stats
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-base-content/70 flex items-center gap-2"
                    ><svg lucideCheckCircle class="w-4 h-4 text-success"></svg> Tasks
                    Completed</span
                  >
                  <span class="font-bold text-base-content">142</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-base-content/70 flex items-center gap-2"
                    ><svg lucideClock class="w-4 h-4 text-warning"></svg> In Progress</span
                  >
                  <span class="font-bold text-base-content">8</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-base-content/70 flex items-center gap-2"
                    ><svg lucideKanban class="w-4 h-4 text-info"></svg> Active Boards</span
                  >
                  <span class="font-bold text-base-content">5</span>
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
                  <li class="flex gap-4">
                    <div
                      class="mt-1 w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0"
                    >
                      <svg lucideCheckCircle class="w-4 h-4 text-success"></svg>
                    </div>
                    <div>
                      <p class="text-sm text-base-content">
                        <span class="font-semibold">Alex</span> completed the task
                        <span class="font-semibold text-primary cursor-pointer hover:underline"
                          >Implement Sidebar Navigation</span
                        >
                      </p>
                      <p class="text-xs text-base-content/50 mt-1">
                        2 hours ago • Frontend Project
                      </p>
                    </div>
                  </li>
                  <li class="flex gap-4">
                    <div
                      class="mt-1 w-8 h-8 rounded-full bg-info/10 flex items-center justify-center shrink-0"
                    >
                      <svg lucideMessageSquare class="w-4 h-4 text-info"></svg>
                    </div>
                    <div>
                      <p class="text-sm text-base-content">
                        <span class="font-semibold">Alex</span> commented on
                        <span class="font-semibold text-primary cursor-pointer hover:underline"
                          >API Integration Bug</span
                        >
                      </p>
                      <div
                        class="mt-2 text-sm text-base-content/70 bg-base-200/50 p-3 rounded-lg border border-base-300"
                      >
                        "I've checked the payload, the issue seems to be in the auth token format."
                      </div>
                      <p class="text-xs text-base-content/50 mt-2">Yesterday • Backend Services</p>
                    </div>
                  </li>
                  <li class="flex gap-4">
                    <div
                      class="mt-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                    >
                      <svg lucideKanban class="w-4 h-4 text-primary"></svg>
                    </div>
                    <div>
                      <p class="text-sm text-base-content">
                        <span class="font-semibold">Alex</span> created a new board
                        <span class="font-semibold text-primary cursor-pointer hover:underline"
                          >Q3 Marketing Site</span
                        >
                      </p>
                      <p class="text-xs text-base-content/50 mt-1">July 8, 2026 • Marketing Team</p>
                    </div>
                  </li>
                </ul>
              </div>
            }

            @if (activeTab() === 'workspaces') {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div
                  class="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5 hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold mb-4"
                  >
                    FE
                  </div>
                  <h4
                    class="font-bold text-base-content group-hover:text-primary transition-colors"
                  >
                    Frontend Guild
                  </h4>
                  <p class="text-xs text-base-content/60 mt-1">3 Boards • 12 Members</p>
                  <div class="mt-4 flex -space-x-2">
                    <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                    <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                    <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                  </div>
                </div>

                <div
                  class="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5 hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-4"
                  >
                    MK
                  </div>
                  <h4
                    class="font-bold text-base-content group-hover:text-primary transition-colors"
                  >
                    Marketing Team
                  </h4>
                  <p class="text-xs text-base-content/60 mt-1">1 Board • 5 Members</p>
                  <div class="mt-4 flex -space-x-2">
                    <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                    <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                  </div>
                </div>
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
  activeTab = signal<'activity' | 'workspaces'>('activity');
}

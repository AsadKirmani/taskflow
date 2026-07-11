import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';
import { ActivityStore } from '../../data-access/activity-store.service';
import { UiSkeletonComponent } from '../../../../ui/components/ui-skeleton.component';
import { UiPageHeaderComponent } from '../../../../ui/components/layout/ui-page-header.component';
import { UiAvatarComponent } from '../../../../ui/components/ui-avatar.component';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { BoardStore } from '../../../boards/data-access/board-store.service';
import { WorkspaceStoreService } from '../../../workspace/data-access/workspace-store.service';
import { UiPageBodyComponent } from '../../../../ui/components/layout/ui-page-body.component';

@Component({
  selector: 'app-activity-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    UiSkeletonComponent,
    UiPageHeaderComponent,
    UiPageBodyComponent,
    UiAvatarComponent,
    UiButtonComponent,
  ],
  template: `
    <section class="rounded-box flex flex-col">
      <div class="min-w-0">
        @if (store.currentBoardId()) {
          <ui-page-header
            [title]="(boardStore.currentBoard()?.name || 'Board') + ' Activity'"
            subtitle="Activities related to the current board"
          ></ui-page-header>
        } @else if (store.currentWorkspaceId()) {
          <ui-page-header
            [title]="(workspaceStore.activeWorkspace()?.slug || 'Workspace') + ' Activity'"
            subtitle="Activities related to the current workspace"
          >
          </ui-page-header>
        } @else {
          <ui-page-header
            title="Your activity feed"
            subtitle="Activities across all your boards and workspaces"
          ></ui-page-header>
        }
      </div>

      <div
        class="flex-1 rounded-b-box bg-base-100 shadow-sm border border-base-300 max-h-[calc(100vh-200px)] overflow-y-auto"
      >
        @if (store.hasError()) {
          <p class="text-sm text-red-600">{{ store.hasError() }}</p>
        } @else if (store.isLoading()) {
          <ui-page-body>
            <ul class="space-y-4">
              @for (item of [1, 2, 3]; track item) {
                <li class="flex gap-3">
                  <ui-skeleton variant="circle" class="h-8 w-8 shrink-0"></ui-skeleton>
                  <div class="flex-1 space-y-2 py-1">
                    <ui-skeleton variant="text" class="h-3 w-[70%]"></ui-skeleton>
                    <ui-skeleton variant="text" class="h-2 w-[40%]"></ui-skeleton>
                  </div>
                </li>
              }
            </ul>
          </ui-page-body>
        } @else if (store.uiItems().length === 0) {
          <div class="text-center py-10">
            <p class="text-sm text-base-content/60">No activity yet. Things are quiet here.</p>
          </div>
        } @else {
          <ui-page-body>
            <div class="flex flex-col">
              @for (group of groupedActivities(); track group.date) {
                <div class="relative">
                  <h4
                    class="sticky top-0 z-20 w-full px-4 py-2.5 mb-3 bg-base-100/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-widest text-base-content/50 border-y border-base-200 shadow-sm"
                  >
                    {{ group.date }}
                  </h4>

                  <ul class="space-y-4 p-4">
                    @for (item of group.items; track item.id) {
                      <li
                        class="group flex items-start gap-3 p-2 -mx-2 border-b border-base-300 hover:bg-base-200/50 transition-colors"
                      >
                        <ui-avatar name="{{ item.actor }}">
                          {{ item.actor.charAt(0).toUpperCase() }}
                        </ui-avatar>

                        <div class="flex flex-col flex-1 min-w-0">
                          <p class="text-[14px] text-base-content m-0 leading-snug">
                            <span class="font-bold text-base-content">{{ item.actor }}</span>
                            <span class="ml-1 text-base-content/90">{{ item.actionText }}</span>
                          </p>

                          @if (item.isComment && item.commentContent) {
                            <div
                              class="mt-2 mb-1 w-full max-w-lg bg-base-100 border border-base-300 shadow-sm rounded-lg p-3 text-sm text-base-content/80 relative"
                              [innerHTML]="item.commentContent"
                            ></div>
                          }

                          <div
                            class="text-[12px] text-base-content/50 mt-1 flex flex-wrap gap-x-2 gap-y-1 items-center"
                          >
                            <span>{{ item.createdAt | date: 'h:mm a' }}</span>

                            @for (tag of item.locationTags; track tag) {
                              <span class="flex items-center gap-1">
                                <span class="w-1 h-1 rounded-full bg-base-content/30"></span>
                                {{ tag }}
                              </span>
                            }
                          </div>

                          @if (item.deepLink; as link) {
                            @if (link.commands) {
                              <a
                                class="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary-focus hover:underline w-fit"
                                [routerLink]="link.commands"
                                [queryParams]="link.queryParams"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <path
                                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                  />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                {{ link.label }}
                              </a>
                            }
                          }
                        </div>
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
            @if (store.hasMoreItems()) {
              <div class="mt-2 flex justify-center pb-6">
                <ui-button
                  variant="ghost"
                  (click)="store.loadMore()"
                  [disabled]="store.isLoadingMore()"
                  [loading]="store.isLoadingMore()"
                  loadingText="Loading more activity..."
                >
                  Load more activity
                </ui-button>
              </div>
            } @else if (!store.isLoading() && store.uiItems().length > 0) {
              <div class="mt-10 text-center pb-6 border-t border-base-300 pt-6">
                <p
                  class="text-[11px] text-base-content/40 uppercase tracking-widest font-semibold flex items-center justify-center gap-2"
                >
                  <span class="w-4 h-px bg-base-content/20"></span>
                  End of activity history
                  <span class="w-4 h-px bg-base-content/20"></span>
                </p>
              </div>
            }
          </ui-page-body>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityPageComponent implements OnInit {
  protected readonly store = inject(ActivityStore);
  private readonly route = inject(ActivatedRoute);
  private authStore = inject(AuthStoreService);
  boardStore = inject(BoardStore);
  workspaceStore = inject(WorkspaceStoreService);

  groupedActivities = computed(() => {
    const items = this.store.uiItems();
    const groups = new Map<string, typeof items>();

    items.forEach((item) => {
      const dateObj = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateString = '';
      if (dateObj.toDateString() === today.toDateString()) {
        dateString = 'Today';
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        dateString = 'Yesterday';
      } else {
        dateString = dateObj.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }

      if (!groups.has(dateString)) {
        groups.set(dateString, []);
      }
      groups.get(dateString)!.push(item);
    });

    return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
  });

  ngOnInit(): void {
    const userId = this.authStore.currentUser()?.id;
    if (!userId) return;

    this.route.paramMap.subscribe((params) => {
      const wId = params.get('workspaceId') ?? undefined;
      const bId = params.get('boardId') ?? undefined;
      if (wId) {
        this.workspaceStore.setActiveWorkspace(wId);
      }

      if (wId && bId) {
        this.store.loadBoardActivity(wId, bId);
      } else if (wId) {
        this.store.loadWorkspaceActivity(wId);
      } else {
        this.store.loadUserActivity(userId);
      }
    });
  }
}

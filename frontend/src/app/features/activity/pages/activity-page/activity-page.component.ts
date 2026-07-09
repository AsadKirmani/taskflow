import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ActivityStore } from '../../data-access/activity-store.service';
import { UiSkeletonComponent } from '../../../../ui/components/ui-skeleton.component';
import { UiPageHeaderComponent } from '../../../../ui/components/layout/ui-page-header.component';
import { AuthStoreService } from '../../../auth/data-access/auth-store.service';
import { BoardStore } from '../../../boards/data-access/board-store.service';
import { WorkspaceStoreService } from '../../../workspace/data-access/workspace-store.service';

@Component({
  selector: 'app-activity-page',
  standalone: true,
  imports: [DatePipe, RouterLink, UiSkeletonComponent, UiPageHeaderComponent],
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

      <div class="flex-1 rounded-b-box bg-base-100 p-3 shadow-sm border border-base-300">
        @if (store.hasError()) {
          <p class="text-sm text-red-600">{{ store.hasError() }}</p>
        } @else if (store.isLoading()) {
          <ul class="space-y-2">
            @for (item of [1, 2, 3, 4, 5]; track item) {
              <li class="rounded-box border border-base-300 p-3 bg-base-200/30">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0 w-full flex flex-col gap-1.5">
                    <ui-skeleton variant="text" class="h-4 w-[85%] sm:w-[60%]"></ui-skeleton>

                    <ui-skeleton
                      variant="text"
                      class="h-3 w-[60%] sm:w-[40%] opacity-70"
                    ></ui-skeleton>

                    <ui-skeleton variant="text" class="h-3 w-[25%] sm:w-[15%] mt-1"></ui-skeleton>
                  </div>

                  <ui-skeleton variant="text" class="h-3 w-20 mt-2 sm:mt-0 shrink-0"></ui-skeleton>
                </div>
              </li>
            }
          </ul>
        } @else if (store.uiItems().length === 0) {
          <p class="text-sm text-base-content/70">No activity yet.</p>
        } @else {
<ul class="space-y-2">
  @for (item of store.uiItems(); track item.id) {
    <li class="border-b border-base-300 last:border-0 hover:bg-base-200 transition-colors p-2 rounded-box">
      <div class="flex items-start gap-1">
        <div class="flex flex-col flex-1">
          <p class="text-[14px] text-base-content m-0">
            <span class="font-bold">{{ item.actor }}</span>
            <span class="ml-1">{{ item.actionText }}</span>
          </p>

          @if (item.isComment && item.commentContent) {
            <div class="mt-1 mb-1 w-64 bg-base-100 border border-base-300 rounded-box p-3 text-sm text-base-content/70" [innerHTML]="item.commentContent"></div>
          }

          <div class="text-[12px] text-base-content/60 mt-1 flex gap-0.5">
            <span>{{ item.createdAt | date: 'd MMM yyyy, h:mm a' }}</span>
            
            @for (tag of item.locationTags; track tag) {
              <span>&bull; {{ tag }}</span>
            }
            </div>

            @if (item.deepLink; as link) {
              @if (link.commands) {
                <a class="my-1 text-xs font-medium text-primary hover:underline w-fit"
                   [routerLink]="link.commands"
                   [queryParams]="link.queryParams">
                  {{ link.label }}
                </a>
              }
            }
        </div>
      </div>
    </li>
  }
</ul>
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

  ngOnInit(): void {
    const userId = this.authStore.currentUser()?.id;
    if (!userId) return;

    this.route.paramMap.subscribe((params) => {
      const wId = params.get('workspaceId') ?? undefined;
      const bId = params.get('boardId') ?? undefined;
      if(wId) {
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

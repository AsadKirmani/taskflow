import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ActivityStore } from '../../data-access/activity-store.service'; // 🚀 Store path update kar lena
import { UiSkeletonComponent } from '../../../../ui/components/ui-skeleton.component';

@Component({
  selector: 'app-activity-page',
  standalone: true,
  imports: [DatePipe, RouterLink, UiSkeletonComponent],
  providers: [ActivityStore], // Optional: Agar global chahiye toh hata dena
  template: `
    <section class="rounded-box flex flex-col gap-2">
  <header class="header bg-base-100 w-full text-base-content p-3 rounded-t-box flex flex-col sm:flex-row sm:items-center sm:justify-between border border-base-300">
    <div class="min-w-0">
      <h1 class="text-2xl font-semibold text-base-content mb-1">Activity</h1>
      <p class="text-sm text-base-content/70">
        @if (store.currentBoardId()) {
          Board activity feed
        } @else if (store.currentWorkspaceId()) {
          Workspace activity feed
        } @else {
          Global activity feed
        }
      </p>
    </div>
    @if (store.currentWorkspaceId()) {
      <span class="text-xs text-base-content/70 bg-base-100 px-2 py-1 rounded break-all self-start sm:self-auto">
        Workspace: {{ store.currentWorkspaceId() }}
      </span>
    }
  </header>

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
                
                <ui-skeleton variant="text" class="h-3 w-[60%] sm:w-[40%] opacity-70"></ui-skeleton>
                
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
          <li class="rounded-box border border-base-300 p-3 hover:bg-base-200 transition-colors">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <p class="text-sm font-medium text-base-content">{{ item.description }}</p>
                <p class="text-xs text-base-content/70">{{ item.context }}</p>
                
                @if (item.deepLink; as link) {
                  @if (link.commands) {
                    <a class="mt-1 inline-flex text-xs font-medium text-primary hover:text-primary-focus hover:underline" [routerLink]="link.commands" [queryParams]="link.queryParams">
                      {{ link.label }}
                    </a>
                  }
                }
              </div>
              <span class="text-xs text-base-content/70 shrink-0">{{ item.createdAt | date:'medium' }}</span>
            </div>
          </li>
        }
      </ul>
    }
  </div>
</section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityPageComponent implements OnInit {
  protected readonly store = inject(ActivityStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const wId = params.get('workspaceId') ?? undefined;
      const bId = params.get('boardId') ?? undefined;
      
      this.store.loadActivities(wId, bId);
    });
  }
}
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ActivityStore } from '../../data-access/activity-store.service'; // 🚀 Store path update kar lena

@Component({
  selector: 'app-activity-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  providers: [ActivityStore], // Optional: Agar global chahiye toh hata dena
  template: `
    <section class="rounded-box flex flex-col gap-2 overflow-y-auto max-h-[83vh] p-top-0 scrollbar-thin scrollbar-thumb-base-content/20 scrollbar-track-base-200">
      <header class="header backdrop-blur-md bg-base-100/70 w-full text-base-content sticky top-0 z-1 p-3 rounded-t-box flex flex-col sm:flex-row sm:items-center sm:justify-between border border-base-content/20 ">
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

      <div class="flex-1 rounded-b-box bg-base-100 p-3 shadow-sm border border-base-content/20">
        @if (store.isLoading()) {
          <p class="text-sm text-base-content/70">Loading activity...</p>
        } @else if (store.hasError()) {
          <p class="text-sm text-red-600">{{ store.hasError() }}</p>
        } @else if (store.uiItems().length === 0) {
          <p class="text-sm text-base-content/70">No activity yet.</p>
        } @else {
          <ul class="space-y-2">
            @for (item of store.uiItems(); track item.id) {
              <li class="rounded-box border border-base-content/20 p-3 hover:bg-base-200 transition-colors">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-base-content">{{ item.description }}</p>
                    <p class="text-xs text-base-content/70">{{ item.context }}</p>
                    
                    @if (item.deepLink; as link) {
                      @if (link.commands) {
                        <a
                          class="mt-1 inline-flex text-xs font-medium text-primary hover:text-primary-focus hover:underline"
                          [routerLink]="link.commands"
                          [queryParams]="link.queryParams"
                        >
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
import { Component, input, signal, computed } from "@angular/core";
import { UiAvatarComponent } from "../../../ui/components/ui-avatar.component";
import { DatePipe } from "@angular/common";
import { APP_ICONS } from "../../../core/icons/lucide-icons";
import { UiButtonComponent } from "../../../ui/components/ui-button.component";
import { ActivityItem } from "../../activity/models/activity.model";
import { getActorName, getActionText, getLocationTags } from "../../activity/data-access/activity-store.service";

@Component({
  selector: "app-task-activity",
  standalone: true,
  imports: [...APP_ICONS, DatePipe, UiButtonComponent, UiAvatarComponent],
  template: `
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-2">
        <svg lucideActivity class="w-5 h-5 text-base-content/70 flex-shrink-0"></svg>
        <h3 class="font-semibold text-base text-base-content m-0">Activity</h3>
      </div>
      @if (activities().length > 4) {
        <ui-button variant="outline" size="sm" (click)="toggleShowAll()">
          {{ showAll() ? 'Hide details' : 'Show details' }}
        </ui-button>
      }
    </div>

    <div class="flex flex-col gap-6 ml-1">
      @for (activity of displayedActivities(); track activity._id) {
        <div class="flex items-start gap-3">
          
          <ui-avatar
            [name]="getActorName(activity)"
            [src]="getAvatarUrl(activity.userId)"
            size="sm"
          ></ui-avatar>

          <div class="flex flex-col flex-1">
            <p class="text-[14px] text-base-content m-0 leading-tight">
              <span class="font-bold">{{ getActorName(activity) }}</span>
              <span class="text-base-content/90 ml-1">{{ getActionText(activity) }}</span>
            </p>

            @if (activity.actionType === 'comment_created' && activity.metadata?.['contentPreview']) {
              <div class="mt-2 mb-1 bg-base-100 border border-base-300 rounded-md p-2.5 text-sm text-base-content" 
                   [innerHTML]="activity.metadata['contentPreview']">
              </div>
            }

            <div class="text-[12px] text-base-content/60 mt-1 flex flex-col gap-0.5">
              <span>{{ activity.createdAt | date: 'd MMM yyyy, h:mm a' }}</span>
            </div>
          </div>
        </div>
      }
      
      @if (activities().length === 0) {
        <div class="text-sm text-base-content/50 italic ml-2">No activity recorded yet.</div>
      }
    </div>
  `
})
export class TaskActivityComponent {
  activities = input<ActivityItem[]>([]);
  showAll = signal(false);

  getActorName = getActorName;
  getActionText = getActionText;
  getLocationTags = getLocationTags;

  displayedActivities = computed(() => {
    const all = [...this.activities()].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (this.showAll() || all.length <= 4) return all;

    const creation = all.find(a => a.actionType === 'task_created') || all[all.length - 1];
    const recent = all.filter(a => a._id !== creation._id).slice(0, 3);
    return [...recent, creation];
  });

  toggleShowAll() { this.showAll.update(v => !v); }

  getAvatarUrl(user: any): string | undefined {
    return user && typeof user === 'object' && 'avatarUrl' in user ? user.avatarUrl : undefined;
  }
}
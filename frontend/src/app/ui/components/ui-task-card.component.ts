import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiCardComponent } from './ui-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-task-card',
  standalone: true,
  imports: [UiCardComponent, CommonModule],
  template: `
    <ui-card [interactive]="true" class="block cursor-grab active:cursor-grabbing">
      <div class="flex flex-col gap-3">
        
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-mono text-base-content/50 uppercase tracking-wider">    
            {{ taskId() }}
          </span>
          <ng-content select="[priority-badge]"></ng-content>
        </div>

        <h4 class="text-sm font-medium leading-snug text-base-content line-clamp-3">
          {{ title() }}
        </h4>

        <div class="flex items-center justify-between mt-1 pt-3 border-t border-base-content/5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <ng-content select="[labels]"></ng-content>
          </div>
          <div class="shrink-0 pl-2">
            <ng-content select="[avatars]"></ng-content>
          </div>
        </div>

      </div>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTaskCardComponent {
  taskId = input.required<string>();
  title = input.required<string>();
}
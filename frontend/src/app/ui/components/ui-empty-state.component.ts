import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center h-full w-full">
      
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-base-200 text-base-content/50 mb-4 shadow-sm border border-base-content/5">
        <ng-content select="[icon]"></ng-content>
      </div>
      
      <h3 class="text-sm font-semibold text-base-content mb-1">
        {{ title() }}
      </h3>
      <p class="text-sm text-base-content/60 max-w-sm mb-6">
        {{ description() }}
      </p>
      
      <ng-content select="[actions]"></ng-content>
      
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyStateComponent {
  title = input.required<string>();
  description = input.required<string>();
}
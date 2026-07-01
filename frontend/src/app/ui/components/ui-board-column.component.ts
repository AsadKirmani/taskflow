import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-board-column',
  standalone: true,
  template: `
    <div class="w-[300px] sm:w-[320px] flex flex-col h-full max-h-full rounded-xl bg-base-200/50 border border-base-300/5">
      
      <div class="p-3 shrink-0 flex items-center justify-between group cursor-grab">
        <div class="flex items-center gap-2">
          <div [class]="'w-2.5 h-2.5 rounded-full ' + statusColor()"></div>
          <h3 class="font-semibold text-sm text-base-content/90">{{ title() }}</h3>
          <span class="text-xs font-medium text-base-content/50 bg-base-300 px-2 py-0.5 rounded-full">
            {{ count() }}
          </span>
        </div>
        <ng-content select="[column-actions]"></ng-content>
      </div>

      <div class="flex-1 overflow-y-auto px-2 pb-3 pt-1 custom-scrollbar flex flex-col gap-2">
        <ng-content></ng-content>
      </div>
      
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBoardColumnComponent {
  title = input.required<string>();
  count = input<number>(0);
  statusColor = input<string>('bg-base-content/20'); // Default dot color
}
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-board-layout',
  standalone: true,
  template: `
    <div class="h-full w-full overflow-x-auto overflow-y-hidden select-none touch-pan-x">
      <div class="inline-flex h-full items-start gap-4 p-4 md:p-6 lg:p-8 min-w-max">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBoardLayoutComponent {}
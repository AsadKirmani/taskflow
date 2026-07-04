import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-content',
  standalone: true,
  template: `
    <main
      class="flex-1 flex flex-col min-h-0 relative"
      [class.px-4]="padding()"
      [class.md:px-6]="padding()"
      [class.lg:px-8]="padding()"
      [class.pb-6]="padding()"
    >
      <ng-content></ng-content>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPageContentComponent {
  padding = input(false);
}

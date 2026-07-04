import { Component } from '@angular/core';

@Component({
  selector: 'ui-page-body',
  standalone: true,
  template: `
    <div
      class="rounded-b-box bg-base-100 p-4 text-sm font-medium text-base-content/70 border border-base-300 flex flex-col gap-4"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class UiPageBodyComponent {}

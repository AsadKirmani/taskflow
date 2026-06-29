import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-header',
  standalone: true,
  template: `
    <div class="header bg-base-100 w-full text-base-content p-4 rounded-t-box flex flex-col sm:flex-row sm:items-center sm:justify-between border border-base-300">
      <div>
        <h1 class="text-2xl font-bold mb-1">{{ title() }}</h1>
        <p class="text-base-content/70 text-sm font-medium">{{ subtitle() }}</p>
      </div>
      <div class="actions flex mt-3 sm:mt-0">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class UiPageHeaderComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}
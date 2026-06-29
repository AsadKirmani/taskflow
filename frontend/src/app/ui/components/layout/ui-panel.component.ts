import { Component } from '@angular/core';

@Component({
  selector: 'ui-panel',
  standalone: true,
  template: `
    <div class="table-body bg-base-100 rounded-box border border-base-300 overflow-hidden">
      <ng-content></ng-content>
    </div>
  `
})
export class UiPanelComponent {}
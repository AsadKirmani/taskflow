import { ChangeDetectionStrategy, Component, input, booleanAttribute, signal } from '@angular/core';

@Component({
  selector: 'ui-tab',
  standalone: true,
  template: `
    <div [class.hidden]="!isActive()" class="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-b-box py-4">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiTabComponent {
  label = input.required<string>(); 
  disabled = input(false, { transform: booleanAttribute });
  isActive = signal(false); 
}
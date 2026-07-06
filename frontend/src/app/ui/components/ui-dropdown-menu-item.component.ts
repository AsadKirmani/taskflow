import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-dropdown-menu-item',
  standalone: true,
  template: `
    <!-- 🚀 Maine click handler ko onClick.emit() rakha hai -->
    <button [class]="computedClass" (click)="onClick.emit()">
      @if (type === 'checkbox') {
        <input type="checkbox" [checked]="checked" />
      }
      @if (type === 'radio') {
        <input type="radio" [checked]="checked" />
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class UiDropdownMenuItemComponent {
  @Input() type: 'button' | 'checkbox' | 'radio' = 'button';
  @Input() checked = false;
  
  @Input() active = false; 
  
  @Output() onClick = new EventEmitter<void>();

  get computedClass() {
    const base = 'w-full px-4 py-2 text-sm flex items-center gap-2 text-base-content transition-colors cursor-pointer';

    if (this.active) {
      return `${base} bg-base-300 border-l-4 border-primary`; 
    }
    return `${base} bg-transparent hover:bg-base-200`;
  }
}
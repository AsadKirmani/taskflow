import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'ui-dropdown-menu-item',
  standalone: true,
  template: `
    <button [class]="computedClass" (click)="onClick.emit()" class="active:bg-base-200">
      @if (type === 'checkbox') { <input type="checkbox" [checked]="checked" /> }
      @if (type === 'radio') { <input type="radio" [checked]="checked" /> }
      <ng-content></ng-content>
    </button>
  `
})
export class UiDropdownMenuItemComponent {
  @Input() type: 'button' | 'checkbox' | 'radio' = 'button';
  @Input() checked = false;
  @Output() onClick = new EventEmitter<void>();
  
  get computedClass() {
    return 'w-full px-4 py-2 text-sm hover:bg-base-200 flex items-center gap-2 text-base-content transition-colors cursor-pointer';
  }
}
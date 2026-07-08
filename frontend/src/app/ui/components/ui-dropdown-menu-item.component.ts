import { Component, input, output, } from '@angular/core';

@Component({
  selector: 'ui-dropdown-menu-item',
  standalone: true,
  template: `
    <button [class]="computedClass" type="button">
      @if (type() === 'checkbox') {
        <input type="checkbox" [checked]="checked()" />
      }
      @if (type() === 'radio') {
        <input type="radio" [checked]="checked()" />
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class UiDropdownMenuItemComponent {
  type = input<'button' | 'checkbox' | 'radio'>('button');
  checked = input<boolean>(false) ;
  active = input<boolean>(false); 
  
  onClick = output<void>();

  get computedClass() {
    const base = 'w-full px-4 py-2 text-sm flex items-center gap-2 text-base-content transition-colors cursor-pointer';

    if (this.active()) {
      return `${base} bg-base-300 border-l-4 border-primary`; 
    }
    return `${base} bg-transparent hover:bg-base-200`;
  }
}
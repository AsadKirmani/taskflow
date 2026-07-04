import { Component, HostListener, ElementRef, inject, input } from '@angular/core';

@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  template: `
    <div class="relative inline-block text-left">
      <div (click)="toggle()">
        <ng-content select="ui-dropdown-menu-trigger"></ng-content>
      </div>

      @if (isOpen) {
        <div
          (click)="close()"
          class="absolute mt-2 w-56 bg-base-100 border border-base-300 rounded-box text-base-content shadow-lg z-50 opacity-100 transform translate-y-0 p-2"
          [class.left-0]="direction() === 'left'"
          [class.right-0]="direction() === 'right'"
          animate.enter="transition ease-out duration-75 transform opacity-0 -translate-y-2"
          animate.leave="transition ease-in duration-75 transform opacity-0 -translate-y-1"
        >
          <ng-content select="ui-dropdown-menu-content"></ng-content>
        </div>
      }
    </div>
  `,
})
export class UiDropdownMenuComponent {
  direction = input<'left' | 'right'>('right');
  isOpen = false;
  private el = inject(ElementRef);

  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen && !this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}

@Component({
  selector: 'ui-dropdown-menu-trigger',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class UiDropdownMenuTrigger {}

@Component({
  selector: 'ui-dropdown-menu-content',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class UiDropdownMenuContent {}

import { Component, HostListener, ElementRef, inject, input, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  template: `
    <div class="relative inline-block text-left" #container>
      <div (click)="toggle()">
        <ng-content select="ui-dropdown-menu-trigger"></ng-content>
      </div>

      @if (isOpen()) {
        <div
          class="fixed z-[9999] w-56 bg-base-100 border border-base-300 rounded-box text-base-content shadow-lg p-2"
          [style.top.px]="position().top"
          [style.left.px]="position().left"
          (click)="close()"
        >
          <ng-content select="ui-dropdown-menu-content"></ng-content>
        </div>
      }
    </div>
  `,
})
export class UiDropdownMenuComponent {
  isOpen = signal(false);
  position = signal({ top: 0, left: 0 });
  
  @ViewChild('container') containerRef!: ElementRef;

  toggle() {
    if (!this.isOpen()) {
      this.calculatePosition();
      this.isOpen.set(true);
    } else {
      this.isOpen.set(false);
    }
  }

  calculatePosition() {
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 224;
    const dropdownHeight = 200;

    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX;

    if (rect.left + dropdownWidth > viewportWidth) {
      left = rect.right + window.scrollX - dropdownWidth;
    }

    if (rect.bottom + dropdownHeight > viewportHeight) {
      top = rect.top + window.scrollY - dropdownHeight - 8;
    }

    this.position.set({ top, left });
  }

  close() { this.isOpen.set(false); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen() && !this.containerRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
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
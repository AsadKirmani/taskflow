import { Component, input, signal, ContentChild, ElementRef } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkMenu } from '@angular/cdk/menu';

@Component({
  selector: 'ui-dropdown-menu-content',
  standalone: true,
  hostDirectives: [CdkMenu],
  host: {
    'class': 'w-56 bg-base-100 border border-base-300 rounded-box text-base-content shadow-lg p-2 outline-none flex flex-col gap-1 block',
    'tabindex': '0'
  },
  template: `<ng-content></ng-content>`
})

export class UiDropdownMenuContent {}
@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  imports: [OverlayModule],
  template: `
    <div 
      class="inline-block relative cursor-pointer outline-none rounded-md focus:ring-2 focus:ring-primary/20" 
      cdkOverlayOrigin 
      #origin="cdkOverlayOrigin"
      (click)="toggle()"
      (keydown.enter)="toggle()"
      (keydown.space)="toggle()"
      tabindex="0"
    >
      <ng-content select="ui-dropdown-menu-trigger"></ng-content>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayPositions]="positions()"
      (overlayOutsideClick)="close()"
      (detach)="close()"
      (attach)="onAttach()" 
    >
      <div (click)="closeDelay()" (keydown.escape)="close()">
        <ng-content select="ui-dropdown-menu-content"></ng-content>
      </div>
    </ng-template>
  `
})
export class UiDropdownMenuComponent {
  direction = input<'left' | 'right'>('right');
  isOpen = signal(false);

  @ContentChild(UiDropdownMenuContent, { read: ElementRef }) content!: ElementRef;

  positions = () => {
    return [
      {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4},
      {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4},
      {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4}
    ] as any;
  }

  toggle() { this.isOpen.update(v => !v); }
  close() { this.isOpen.set(false); }
  
  closeDelay() { 
    setTimeout(() => this.close(), 50); 
  }

  onAttach() {
    if (this.content) {
      this.content.nativeElement.focus();
    }
  }
}

@Component({
  selector: 'ui-dropdown-menu-trigger',
  standalone: true,
  template: `<ng-content></ng-content>`
})
export class UiDropdownMenuTrigger {}


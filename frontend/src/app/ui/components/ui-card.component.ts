import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <div 
      [class]="'bg-base-100 rounded-box border border-base-300/10 overflow-hidden transition-all duration-200 ' + (interactive() ? 'hover:shadow-md hover:border-base-300 cursor-pointer active:scale-[0.99]' : 'shadow-sm')"
    >
      @if (hasHeader()) {
         <div class="px-5 py-3.5 border-b border-base-300/5 bg-base-200/30">
            <ng-content select="[card-header]"></ng-content>
         </div>
      }
      
      <div class="p-5">
        <ng-content></ng-content>
      </div>
      
      @if (hasFooter()) {
         <div class="px-5 py-3 bg-base-200/50 border-t border-base-300/5">
            <ng-content select="[card-footer]"></ng-content>
         </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {
  // If true, adds hover shadows and click animations (perfect for Task Cards)
  interactive = input(false); 
  
  hasHeader = input(false);
  hasFooter = input(false);
}
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-page-layout',
  standalone: true,
  template: `
    <div [class]="computedClasses()">
      <div [class]="'flex flex-col w-full h-full mx-auto ' + maxWClasses()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPageLayoutComponent {
  maxWidth = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('lg');
  
  // If false, it locks the page height to 100% so inner containers can scroll (crucial for Kanban)
  scrollable = input(true);

  computedClasses = computed(() => {
    const base = 'flex flex-col w-full bg-base-100 transition-colors duration-200';
    // If scrollable, it can grow infinitely. If not, it's locked to h-full with overflow hidden.
    const scrollStyles = this.scrollable() 
      ? 'min-h-full overflow-y-auto overflow-x-hidden' 
      : 'h-full overflow-hidden';
      
    return `${base} ${scrollStyles}`;
  });

  maxWClasses = computed(() => {
    const widths = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[96rem]',
      full: 'max-w-none'
    };
    return widths[this.maxWidth()];
  });
}
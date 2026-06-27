import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  template: `
    <div [class]="computedClasses()" [style.width]="width()" [style.height]="height()"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSkeletonComponent {
  // text = rounded-md, circle = rounded-full, rect = rounded-xl
  variant = input<'text' | 'circle' | 'rect'>('text');
  
  // Custom dimensions (e.g., '100%', '40px', '2rem')
  width = input<string>();
  height = input<string>();

  computedClasses = computed(() => {
    const base = 'animate-pulse bg-base-300';
    const variants = {
      text: 'rounded-md h-4 w-full',
      circle: 'rounded-full',
      rect: 'rounded-xl w-full h-full'
    };
    return `${base} ${variants[this.variant()]}`;
  });
}
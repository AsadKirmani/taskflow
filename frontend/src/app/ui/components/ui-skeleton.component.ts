import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  template: '', // BINGO! Koi inner HTML ki zaroorat nahi
  host: {
    '[class]': 'computedClasses()',
    '[style.width]': 'width()',
    '[style.height]': 'height()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSkeletonComponent {
  // text = rounded-md, circle = rounded-full, rect = rounded-xl
  variant = input<'text' | 'circle' | 'rect'>('text');
  
  // Custom dimensions (e.g., '100%', '40px', '2rem')
  width = input<string>();
  height = input<string>();

  computedClasses = computed(() => {
    // Note: 'block' add kiya hai kyunki custom HTML elements default 'inline' hote hain
    const base = 'block animate-pulse bg-base-300'; 
    
    const variants = {
      text: 'rounded-md',
      circle: 'rounded-full',
      rect: 'rounded-xl'
    };
    
    return `${base} ${variants[this.variant()]}`;
  });
}
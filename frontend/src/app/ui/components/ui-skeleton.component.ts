import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  template: '',
  host: {
    '[class]': 'computedClasses()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSkeletonComponent {
  variant = input<'text' | 'circle' | 'rect'>('text');

  width = input<string>();
  height = input<string>();

  computedClasses = computed(() => {
    const base = 'block animate-pulse bg-base-300';

    const variants = {
      text: 'rounded-md',
      circle: 'rounded-full',
      rect: 'rounded-xl',
    };

    return `${base} ${variants[this.variant()]}`;
  });
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-stack',
  standalone: true,
  template: `
    <div [class]="computedClasses()">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiStackComponent {
  direction = input<'row' | 'col'>('col');
  align = input<'start' | 'center' | 'end' | 'stretch'>('stretch');
  justify = input<'start' | 'center' | 'end' | 'between'>('start');
  gap = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  wrap = input(false);

  class = input<string>('');

  computedClasses = computed(() => {
    const base = 'flex';

    const directions = { row: 'flex-row', col: 'flex-col' };
    const alignments = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };
    const justifications = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };
    const gaps = { none: 'gap-0', xs: 'gap-1', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' };

    return [
      base,
      directions[this.direction()],
      alignments[this.align()],
      justifications[this.justify()],
      gaps[this.gap()],
      this.wrap() ? 'flex-wrap' : 'flex-nowrap',
      this.class(),
    ]
      .filter(Boolean)
      .join(' ');
  });
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  template: `
    <div [class]="containerClasses()">
      
      <div [class]="iconClasses()">
        <ng-content select="[icon]"></ng-content>
      </div>
      
      <h3 [class]="titleClasses()">
        {{ title() }}
      </h3>
      
      <p [class]="descClasses()">
        {{ description() }}
      </p>
      
      <ng-content select="[actions]"></ng-content>
      
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyStateComponent {
  title = input.required<string>();
  description = input.required<string>();
  
  // 🚀 Added size input: default 'normal' rahega
  size = input<'normal' | 'compact'>('normal');

  // Dynamic Styles based on size signal
  containerClasses = computed(() => {
    const base = 'flex flex-col items-center justify-center text-center h-full w-full select-none';
    const padding = this.size() === 'compact' ? 'p-2' : 'py-12 px-4';
    return `${base} ${padding}`;
  });

  iconClasses = computed(() => {
    const base = 'flex items-center justify-center rounded-full bg-base-200 text-base-content/50 border border-base-300/5';
    const dimensions = this.size() === 'compact' ? 'w-8 h-8 mb-2' : 'w-12 h-12 mb-4 shadow-sm';
    return `${base} ${dimensions}`;
  });

  titleClasses = computed(() => {
    const base = 'font-semibold text-base-content';
    const typography = this.size() === 'compact' ? 'text-xs mb-0.5' : 'text-sm mb-1';
    return `${base} ${typography}`;
  });

  descClasses = computed(() => {
    const base = 'text-base-content/60 mx-auto';
    const typography = this.size() === 'compact' ? 'text-[11px] max-w-[180px] mb-1' : 'text-sm max-w-sm mb-6';
    return `${base} ${typography}`;
  });
}
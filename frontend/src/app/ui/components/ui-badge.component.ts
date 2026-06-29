import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `
    <span [class]="computedClasses()">
      <ng-content></ng-content>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBadgeComponent {
  variant = input<'neutral' | 'info' | 'success' | 'warning' | 'error'>('neutral');
  
  computedClasses = computed(() => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-semibold tracking-wide border uppercase';
    
    const variants = {
      neutral: 'bg-base-200 text-base-content/70 border-base-content/10',
      info: 'bg-info/10 text-info border-info/20',
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20', 
      error: 'bg-error/10 text-error border-error/20'
    };

    return `${base} ${variants[this.variant()]}`;
  });
}
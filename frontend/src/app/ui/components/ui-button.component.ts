import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="computedClasses()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="loading loading-spinner w-4 h-4 mr-2"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg' | 'icon'>('md');
  disabled = input(false);
  loading = input(false);
  
  clicked = output<MouseEvent>();

  computedClasses = computed(() => {
    // Base styles with active scale effect
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-100 rounded-btn focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap';
    
    const variants = {
      primary: 'bg-primary text-primary-content hover:bg-primary/90 focus:ring-primary/50 shadow-sm',
      secondary: 'bg-base-200 text-base-content hover:bg-base-300 border border-base-content/10 focus:ring-base-content/20',
      ghost: 'bg-transparent text-base-content hover:bg-base-200 focus:ring-base-content/20',
      danger: 'bg-error text-error-content hover:bg-error/90 focus:ring-error/50 shadow-sm'
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-2' // For icon-only buttons
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  });
}
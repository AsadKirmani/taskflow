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
        <span class="loading loading-spinner w-4 h-4 mr-2">
        <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        </span>
      }
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  // 🚀 Yahan 'icon-sm' add kiya
  size = input<'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'>('md'); 
  disabled = input(false);
  loading = input(false);
  
  clicked = output<MouseEvent>();

  computedClasses = computed(() => {
    // Base styles (ismein rounded-btn hai, jo aage override ho jayega jahan zaroorat hogi)
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-btn whitespace-nowrap';
    
    const variants = {
      primary: 'bg-primary text-primary-content hover:bg-primary/90 focus:ring-primary/50 shadow-sm',
      secondary: 'bg-secondary text-secondary-content hover:bg-secondary/90 border border-secondary-content/10 focus:ring-secondary/20',
      ghost: 'bg-transparent text-base-content hover:bg-base-200 focus:ring-base-content/20',
      danger: 'bg-error text-error-content hover:bg-error/90 focus:ring-error/50 shadow-sm'
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-2 rounded-full', // Ise bhi full circle kar diya
      'icon-sm': 'h-7 w-7 p-0 !rounded-full' // 🚀 Perfect circle for small toolbars (overrides rounded-btn)
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  });
}
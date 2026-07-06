import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [class]="computedClasses()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <svg
          class="animate-spin shrink-0"
          [class.mr-2]="!isIconSize()"
          [class.w-4]="!isSmallIcon()"
          [class.h-4]="!isSmallIcon()"
          [class.w-3]="isSmallIcon()"
          [class.h-3]="isSmallIcon()"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            fill="none"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>

        @if (loadingText()) {
          <span>{{ loadingText() }}</span>
        } @else if (!isIconSize()) {
          <ng-content></ng-content>
        }
      } @else {
        <ng-content></ng-content>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'outline' | 'secondary' | 'ghost' | 'danger' | 'icon'>('primary');
  size = input<'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'>('md');
  active = input(false);
  disabled = input(false);
  loading = input(false);
  loadingText = input<string | null>(null);

  clicked = output<MouseEvent>();

  isIconSize = computed(() => this.size() === 'icon' || this.size() === 'icon-sm');
  isSmallIcon = computed(() => this.size() === 'icon-sm');

  computedClasses = computed(() => {
    const base =
      'inline-flex items-center justify-center cursor-pointer font-medium transition-all duration-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap';
      let activeClasses = '';
    if (this.active()) {
      const v = this.variant();
      if (v === 'ghost' || v === 'icon' || v === 'outline') {
        activeClasses = 'bg-base-300 ring-2 ring-primary/20 ring-offset-1'; 
      } else {
        activeClasses = 'ring-2 ring-offset-2 !opacity-100'; 
      }
    }

    const variants = {
      primary:
        'bg-primary text-primary-content hover:bg-primary/90 focus:ring-primary/50 shadow-sm',
      secondary:
        'bg-secondary text-secondary-content hover:bg-secondary/90 border border-secondary-content/10 focus:ring-secondary/20',
      ghost: 'bg-transparent text-base-content hover:bg-base-300 focus:ring-base-content/20',
      danger: 'bg-error text-error-content hover:bg-error/90 focus:ring-error/50 shadow-sm',
      icon: 'bg-transparent text-base-content hover:bg-base-300 border border-base-300 focus:ring-base-content/20',
      outline: 'bg-transparent text-base-content border border-base-300 hover:bg-base-100 focus:ring-base-content/20',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-2 rounded-full',
      'icon-sm': 'h-7 w-7 p-0 !rounded-full',
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${activeClasses.trim()}`;
  });
}

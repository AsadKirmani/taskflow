import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  template: `
    <div [class]="computedClasses()">
      @if (src()) {
        <img [src]="src()" [alt]="alt()" class="w-full h-full object-cover" />
      } @else {
        <span class="font-medium text-base-content/60">{{ initials() }}</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAvatarComponent {
  src = input<string>();
  alt = input<string>('Avatar');
  fallback = input<string>('?');
  size = input<'sm' | 'md' | 'lg'>('md');

  // Extracts first two letters for the fallback (e.g., "John Doe" -> "JO")
  initials = computed(() => this.fallback().substring(0, 2).toUpperCase());

  computedClasses = computed(() => {
    const base = 'relative flex items-center justify-center shrink-0 rounded-full bg-base-300 overflow-hidden border border-base-content/10';
    const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
    return `${base} ${sizes[this.size()]}`;
  });
}
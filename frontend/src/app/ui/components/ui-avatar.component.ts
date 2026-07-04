import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  template: `
    <div [class]="computedClasses()">
      @if (src()) {
        <img
          [src]="src() + '?t=' + lastUpdated()"
          [alt]="alt()"
          class="w-full h-full object-cover"
        />
      } @else {
        <span class="font-medium text-base-content">{{ initials() }}</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAvatarComponent {
  avatarColor: string = '';

  private colors: string[] = [
    'bg-primary/10',
    'bg-secondary/10',
    'bg-accent/10',
    'bg-info/10',
    'bg-success/10',
    'bg-warning/10',
    'bg-error/10',
  ];

  ngOnInit() {
    this.assignRandomColor();
  }

  assignRandomColor() {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    this.avatarColor = this.colors[randomIndex];
  }
  src = input<string | null | undefined>('');
  lastUpdated = signal(Date.now());
  alt = input<string>('Avatar');
  name = input<string>('Unknown User');
  size = input<'sm' | 'md' | 'lg'>('md');
  initials = computed(() =>
    this.name()
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2),
  );

  computedClasses = computed(() => {
    const base = `relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-base-300/10 ${this.avatarColor}`;
    const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
    return `${base} ${sizes[this.size()]}`;
  });
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UiAvatarComponent } from './ui-avatar.component';

@Component({
  selector: 'ui-avatar-stack',
  standalone: true,
  imports: [UiAvatarComponent],
  template: `
    <div class="flex items-center -space-x-2">
      @for (user of displayUsers(); track user.id) {
        <ui-avatar 
          [src]="user.avatar" 
          [fallback]="user.name" 
          [size]="size()" 
          class="ring-2 ring-base-100" 
        />
      }
      
      @if (remainingCount() > 0) {
        <div [class]="'relative flex items-center justify-center shrink-0 rounded-full bg-base-200 ring-2 ring-base-100 z-10 text-base-content/70 font-medium ' + sizeClasses()">
          +{{ remainingCount() }}
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAvatarStackComponent {
  users = input<{id: string, name: string, avatar?: string}[]>([]);
  limit = input(3);
  size = input<'sm' | 'md' | 'lg'>('sm');

  displayUsers = computed(() => this.users().slice(0, this.limit()));
  remainingCount = computed(() => Math.max(0, this.users().length - this.limit()));

  sizeClasses = computed(() => {
     const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
     return sizes[this.size()];
  });
}
import { Component, input, output } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { UiAvatarComponent } from '../../../ui/components/ui-avatar.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-task-assignees',
  standalone: true,
  imports: [CommonModule, UiAvatarComponent, UiButtonComponent, ...APP_ICONS],
  template: `<div class="flex items-center gap-1">
    <div class="flex -space-x-3">
      @for (member of members(); track member.id) {
        <ui-avatar [name]="member.name" [title]="member.name"></ui-avatar>
      }
    </div>
    @if (members().length > 0) {
      <ui-button
      variant="icon"
      size="icon"
      (click)="openPicker.emit()"
      >
        <svg lucidePlus class="w-4 h-4"></svg>
      </ui-button>
    }
  </div>`,
})
export class TaskAssigneesComponent {
  members = input.required<User[]>();
  openPicker = output<void>();
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskMenuComponent } from './task-menu.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-task-header',
  standalone: true,
  template: `<header class="flex items-center justify-between px-5 py-3 border-b border-base-300">
    <div
      class="bg-base-100 hover:bg-base-200 cursor-pointer px-3 py-1.5 rounded-md text-sm font-semibold text-base-content flex items-center gap-1 transition-colors"
    >
      {{ columnName() }}
      <svg lucideChevronDown class="w-4 h-4 text-base-content/70"></svg>
    </div>
    <div class="flex items-center gap-1 text-base-content/70">
      <ui-button
      variant="ghost"
      size="sm"
      >
        <svg lucideImage class="w-5 h-5"></svg>
      </ui-button>
      <app-task-menu></app-task-menu>
      <ui-button
      variant="ghost"
      size="icon-sm"
        (click)="menuClicked.emit()"
      >
        <svg lucideX class="w-5 h-5"></svg>
      </ui-button>
    </div>
  </header>`,
  imports: [CommonModule, TaskMenuComponent, UiButtonComponent, ...APP_ICONS],
})
export class TaskHeaderComponent {
  columnName = input.required<string>();
  menuClicked = output<void>();
}

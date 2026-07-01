import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskMenuComponent } from './task-menu.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';

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
        <button
          class="p-1.5 hover:bg-base-100 rounded-box transition-colors flex items-center justify-center"
        >
          <svg lucideImage class="text-[20px] w-5 h-5"></svg>
        </button>
        <app-task-menu></app-task-menu>
        <button
          (click)="menuClicked.emit()"
          class="p-1.5 hover:bg-base-100 rounded-box transition-colors flex items-center justify-center ml-2"
        >
          <svg lucideX class="text-[20px] w-5 h-5"></svg>
        </button>
      </div>
    </header>`,
  imports: [CommonModule,TaskMenuComponent, ...APP_ICONS],
})
export class TaskHeaderComponent {
     columnName = input.required<string>();
     menuClicked = output<void>();
}
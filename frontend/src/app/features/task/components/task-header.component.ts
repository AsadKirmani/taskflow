import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TaskMenuComponent } from './task-menu.component';

@Component({
  selector: 'app-task-header',
  standalone: true,
  template: `<header class="flex items-center justify-between px-5 py-3 border-b border-base-content/20">
      <div
        class="bg-base-100 hover:bg-base-200 cursor-pointer px-3 py-1.5 rounded-md text-sm font-semibold text-base-content flex items-center gap-1 transition-colors"
      >
        {{ columnName() }}
        <mat-icon class="text-[16px] w-4 h-4 leading-none">keyboard_arrow_down</mat-icon>
      </div>
      <div class="flex items-center gap-1 text-base-content/70">
        <button
          class="p-1.5 hover:bg-base-100 rounded-box transition-colors flex items-center justify-center"
        >
          <mat-icon class="text-[20px] w-5 h-5">image</mat-icon>
        </button>
        <app-task-menu></app-task-menu>
        <button
          (click)="menuClicked.emit()"
          class="p-1.5 hover:bg-base-100 rounded-box transition-colors flex items-center justify-center ml-2"
        >
          <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
        </button>
      </div>
    </header>`,
  imports: [CommonModule, MatIconModule, TaskMenuComponent],
})
export class TaskHeaderComponent {
     columnName = input.required<string>();
     menuClicked = output<void>();
}
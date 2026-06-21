import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-header',
  standalone: true,
  template: `<header class="flex items-center justify-between px-5 py-3 border-b border-base-content/20">
      <div
        class="bg-base-100 hover:bg-base-200 cursor-pointer px-3 py-1.5 rounded-md text-sm font-semibold text-base-content flex items-center gap-1 transition-colors"
      >
        
        <mat-icon class="text-[16px] w-4 h-4 leading-none">keyboard_arrow_down</mat-icon>
      </div>
      <div class="flex items-center gap-1 text-base-content/70">
        <button
          class="p-1.5 hover:bg-base-100 rounded-box transition-colors flex items-center justify-center"
        >
          <mat-icon class="text-[20px] w-5 h-5">image</mat-icon>
        </button>
        <button
          class="p-1.5 hover:bg-base-100 rounded-box transition-colors flex items-center justify-center"
        >
          <mat-icon class="text-[20px] w-5 h-5">more_horiz</mat-icon>
        </button>
        <button
          (click)="menuClicked.emit()"
          class="p-1.5 hover:bg-base-100 rounded-box transition-colors flex items-center justify-center ml-2"
        >
          <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
        </button>
      </div>
    </header>`,
  imports: [CommonModule, MatIconModule],
})
export class TaskHeaderComponent {
     menuClicked = output<void>();
}
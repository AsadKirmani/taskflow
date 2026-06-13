import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChecklistItem } from '../../../../../core/models/task.model'; 

@Component({
  selector: 'app-task-checklist',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex items-start gap-3">
      <mat-icon class="text-base-content w-6 h-6 flex-shrink-0 mt-0.5">check_box</mat-icon>
      <div class="flex-1 w-full relative">
        <h3 class="font-semibold text-base mb-3 text-base-content">Checklist</h3>
        
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs font-bold text-base-content/70 w-8">{{ progressPercentage() }}%</span>
          <div class="flex-1 h-2 bg-base-200 rounded-full overflow-hidden border border-base-content/10">
            <div 
              class="h-full transition-all duration-500 ease-out"
              [ngClass]="progressPercentage() === 100 ? 'bg-success' : 'bg-primary'"
              [style.width.%]="progressPercentage()">
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 bg-base-100 p-4 rounded-md border border-base-content/10 shadow-sm">
          
          @for (item of checklist(); track $index; let i = $index) {
            <div class="flex items-center gap-3 group hover:bg-base-200/50 p-1.5 rounded transition-colors">
              <input 
                type="checkbox" 
                [checked]="item.isCompleted" 
                (change)="onToggle(i, $event)" 
                class="checkbox checkbox-sm checkbox-primary rounded cursor-pointer" 
              />
              
              <span 
                [class.line-through]="item.isCompleted" 
                [class.text-base-content]="!item.isCompleted"
                [class.text-base-content]="item.isCompleted"
                [style.opacity]="item.isCompleted ? '0.5' : '1'"
                class="text-sm font-medium flex-1 transition-all">
                {{ item.title }}
              </span>
              
              <button (click)="onDelete(i)" class="opacity-0 group-hover:opacity-100 text-error hover:bg-error/20 p-1.5 rounded transition-all cursor-pointer">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">delete</mat-icon>
              </button>
            </div>
          }
          
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-base-content/10">
            <input 
              #newItemInput 
              type="text" 
              placeholder="Add an item..." 
              class="input input-sm input-bordered flex-1 bg-base-200 focus:outline-primary" 
              (keyup.enter)="onAdd(newItemInput.value); newItemInput.value = ''" 
            />
            <button 
              (click)="onAdd(newItemInput.value); newItemInput.value = ''" 
              class="bg-base-200 hover:bg-base-300 text-base-content px-4 py-1.5 rounded text-sm font-medium transition-colors border border-base-content/10 shadow-sm">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskChecklistComponent {
  // Inputs & Outputs
  checklist = input.required<ChecklistItem[]>();
  
  itemAdded = output<string>();
  itemToggled = output<{ index: number, isCompleted: boolean }>();
  itemDeleted = output<number>();

  // 🚀 Computed Signals for Progress Bar (Auto-calculates)
  totalItems = computed(() => this.checklist().length);
  completedItems = computed(() => this.checklist().filter(item => item.isCompleted).length);
  
  progressPercentage = computed(() => {
    if (this.totalItems() === 0) return 0;
    return Math.round((this.completedItems() / this.totalItems()) * 100);
  });

  onAdd(title: string) {
    if (title.trim()) {
      this.itemAdded.emit(title.trim());
    }
  }

  onToggle(index: number, event: Event) {
    const isCompleted = (event.target as HTMLInputElement).checked;
    this.itemToggled.emit({ index, isCompleted });
  }

  onDelete(index: number) {
    this.itemDeleted.emit(index);
  }
}
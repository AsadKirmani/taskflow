import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistItem } from '../../../core/models/task.model';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-task-checklist',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, ...APP_ICONS],
  template: `
    <div class="flex items-start gap-3">
      <svg lucideSquareCheck class="w-5 h-5 text-base-content/70 flex-shrink-0"></svg>
      <div class="flex-1 w-full relative">
        <h3 class="font-semibold text-base mb-3 text-base-content">Checklist</h3>

        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs font-bold text-base-content/70 w-8"
            >{{ progressPercentage() }}%</span
          >
          <div class="flex-1 h-2 bg-base-200 rounded-full overflow-hidden border border-base-300">
            <div
              class="h-full transition-all duration-500 ease-out"
              [ngClass]="progressPercentage() === 100 ? 'bg-success' : 'bg-primary'"
              [style.width.%]="progressPercentage()"
            ></div>
          </div>
        </div>

        <div
          class="flex flex-col gap-2 bg-base-100 p-4 rounded-md border border-base-300 shadow-sm"
        >
          @for (item of checklist(); track $index; let i = $index) {
            <div
              class="flex items-center gap-3 group hover:bg-base-200/50 p-1.5 rounded transition-colors"
            >
              <input
                type="checkbox"
                [checked]="item.isCompleted"
                (change)="onToggle(i, $event)"
                class="checkbox checkbox-sm checkbox-primary rounded cursor-pointer"
              />

              <span
                [class.line-through]="item.isCompleted"
                [class.text-base-content/70]="!item.isCompleted"
                [class.text-base-content]="item.isCompleted"
                class="text-sm font-medium flex-1 transition-all"
              >
                {{ item.title }}
              </span>

              <ui-button
                (click)="onDelete(i)"
                variant="icon"
                size="icon-sm"
              >
                <svg lucideTrash class="w-4 h-4"></svg>
              </ui-button>
            </div>
          }

          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-base-300">
            <input
              #newItemInput
              type="text"
              placeholder="Add an item..."
              class="focus:outline-none w-full px-3 py-1.5 text-sm text-base-content rounded-field border border-base-300 focus:border-primary transition-colors"
              (keyup.enter)="onAdd(newItemInput.value); newItemInput.value = ''"
            />
            <ui-button
              (click)="onAdd(newItemInput.value); newItemInput.value = ''"
              variant="outline"
              size="sm"
            >
              Add
            </ui-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TaskChecklistComponent {
  checklist = input.required<ChecklistItem[]>();

  itemAdded = output<string>();
  itemToggled = output<{ index: number; isCompleted: boolean }>();
  itemDeleted = output<number>();

  totalItems = computed(() => this.checklist().length);
  completedItems = computed(() => this.checklist().filter((item) => item.isCompleted).length);

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

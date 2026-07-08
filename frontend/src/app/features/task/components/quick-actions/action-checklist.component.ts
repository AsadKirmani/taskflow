import { Component, output, signal } from '@angular/core';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';

@Component({
  selector: 'app-action-checklist',
  standalone: true,
  imports: [AutofocusDirective, UiButtonComponent, ...APP_ICONS],
  template: `
    <div class="relative inline-flex">
      <ui-button
        variant="outline"
        (click)="isOpen.set(!isOpen())"
        [active]="isOpen()"
      >
        <svg lucideSquareCheck class="w-4 h-4 mr-2"></svg> Checklist
      </ui-button>

      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>

        <div
          class="absolute top-full left-0 mt-2 w-64 bg-base-100 border border-base-300 shadow-2xl rounded-lg z-50 p-3 animate-in fade-in zoom-in-95 duration-200"
        >
          <h4 class="text-xs font-bold text-base-content/70 uppercase mb-3 text-center">
            Add Checklist
          </h4>

          <div class="flex flex-col gap-3 relative z-50">
            <input
              #itemInput
              type="text"
              placeholder="Add an item..."
              class="focus:outline-none w-full px-3 py-1.5 text-sm text-base-content rounded-field border border-base-300 focus:border-primary transition-colors"
              (keyup.enter)="add(itemInput.value)"
              appAutofocus
            />
            <ui-button
              (click)="add(itemInput.value)"
              variant="primary"
              size="sm"
            >
              Add Item
            </ui-button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ActionChecklistComponent {
  itemAdded = output<string>();

  isOpen = signal(false);

  add(title: string) {
    if (!title.trim()) return;
    this.itemAdded.emit(title);
    this.isOpen.set(false);
  }
}

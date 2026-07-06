import { Component, HostListener, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextEditorComponent } from '../../../shared/components/editor/text-editor.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-task-description',
  standalone: true,
  imports: [CommonModule, TextEditorComponent, UiButtonComponent, ...APP_ICONS],
  template: `
    <div class="flex items-start gap-3">
      <svg lucideTextAlignStart class="w-5 h-5 text-base-content/70 flex-shrink-0"></svg>
      <div class="flex-1 w-full relative">
        <h3 class="font-semibold text-base mb-3 text-base-content">Description</h3>

        @if (!isEditing()) {
          <div
            (click)="enableEdit()"
            class="bg-base-100 hover:bg-base-200 border border-base-300 min-h-[5rem] rounded-md p-4 text-sm cursor-pointer transition-colors prose prose-sm max-w-none text-base-content"
            [innerHTML]="description() || 'Add a more detailed description...'"
          ></div>
        } @else {
          <div class="flex flex-col gap-2 animate-in fade-in duration-200">
            <app-text-editor
              [(value)]="descValue"
              placeholder="Write a detailed description..."
              minHeight="150px"
            ></app-text-editor>
            <div class="flex gap-2 mt-1">
              <ui-button
                (click)="save()"
                variant="primary"
                size="sm"
                [loading]="isSaving()"
                loadingText="Saving..."
              >
                Save
              </ui-button>
              <ui-button
                (click)="cancelEdit()"
                variant="ghost"
                size="sm"
              >
                Cancel
              </ui-button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TaskDescriptionComponent {
  description = input<string | undefined>('');
  saved = output<string>();
  isSaving = signal(false);

  isEditing = signal(false);
  descValue = signal('');

  enableEdit() {
    this.descValue.set(this.description() || '');
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  save() {
    this.isSaving.set(true);
    this.saved.emit(this.descValue());
    this.isEditing.set(false);
    this.isSaving.set(false);
  }
  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.save();
    }
  }
}

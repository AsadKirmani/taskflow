import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TextEditorComponent } from '../../../shared/components/editor/text-editor.component';

@Component({
  selector: 'app-task-description',
  standalone: true,
  imports: [CommonModule, MatIconModule, TextEditorComponent],
  template: `
    <div class="flex items-start gap-3">
      <mat-icon class="text-base-content w-6 h-6 flex-shrink-0">subject</mat-icon>
      <div class="flex-1 w-full relative">
        <h3 class="font-semibold text-base mb-3 text-base-content">Description</h3>
        
        @if (!isEditing()) {
          <div 
            (click)="enableEdit()"
            class="bg-base-100 hover:bg-base-200 border border-base-content/10 hover:border-base-content/30 min-h-[5rem] rounded-md p-4 text-sm cursor-pointer transition-colors prose prose-sm max-w-none text-base-content"
            [innerHTML]="description() || 'Add a more detailed description...'">
          </div>
        } @else {
          <div class="flex flex-col gap-2 animate-in fade-in duration-200">
            <app-text-editor [(value)]="descValue" placeholder="Write a detailed description..." minHeight="150px"></app-text-editor>
            <div class="flex gap-2 mt-1">
              <button (click)="save()" class="bg-primary hover:bg-primary/90 text-base-100 text-sm font-medium px-4 py-1.5 rounded-box transition-colors">Save</button>
              <button (click)="cancelEdit()" class="hover:bg-base-300 text-base-content text-sm font-medium px-4 py-1.5 rounded-box transition-colors">Cancel</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TaskDescriptionComponent {
  description = input<string | undefined>('');
  saved = output<string>();

  isEditing = signal(false);
  descValue = signal('');

  enableEdit() {
    this.descValue.set(this.description() || '');
    this.isEditing.set(true);
  }
  
  cancelEdit() { this.isEditing.set(false); }
  
  save() {
    this.saved.emit(this.descValue());
    this.isEditing.set(false);
  }
}
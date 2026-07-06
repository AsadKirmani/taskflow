import { CommonModule } from '@angular/common';
import { Component, output, ViewChild, ElementRef } from '@angular/core';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';

@Component({
  selector: 'app-action-attachments',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, ...APP_ICONS],
  template: `
    <ui-button
      variant="outline"
      (click)="fileInput.click()"
    >
      <svg lucidePaperclip class="w-4 h-4 mr-2"></svg>
      Attach
    </ui-button>
    <input type="file" #fileInput class="hidden" (change)="onFileChange($event)" />
  `,
})
export class ActionAttachmentsComponent {
  fileSelected = output<File>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.fileSelected.emit(file);
    this.fileInput.nativeElement.value = '';
  }
}

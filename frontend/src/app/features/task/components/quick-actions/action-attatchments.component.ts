import { CommonModule } from '@angular/common';
import { Component, output, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-attachments',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  template: `
    <button (click)="fileInput.click()" class="flex items-center gap-1.5 bg-base-100 hover:bg-base-300 text-base-content px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-base-content/20 w-full">
      <mat-icon>attach_file</mat-icon> 
      Attach
    </button>
    <input type="file" #fileInput class="hidden" (change)="onFileChange($event)" />
  `
})
export class ActionAttachmentsComponent {
  fileSelected = output<File>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.fileSelected.emit(file);
    this.fileInput.nativeElement.value = ''; // Taaki same file wapas select ho sake
  }
}
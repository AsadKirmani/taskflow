import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-checklist',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="relative inline-flex">
      <button 
        (click)="isOpen.set(!isOpen())" 
        [ngClass]="isOpen() ? 'bg-base-content text-base-100 hover:bg-base-content/90' : 'bg-base-100 text-base-content hover:bg-base-300'"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-base-content/10">
        <mat-icon class="text-[18px] w-[18px] h-[18px]">check_box</mat-icon> Checklist
      </button>

      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>
        
        <div class="absolute top-full left-0 mt-2 w-64 bg-base-100 border border-base-content/10 shadow-2xl rounded-lg z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
          <h4 class="text-xs font-bold text-base-content/70 uppercase mb-3 text-center">Add Checklist</h4>
          
          <div class="flex flex-col gap-3 relative z-50">
            <input 
              #itemInput 
              type="text" 
              placeholder="Add an item..." 
              class="input input-sm input-bordered w-full bg-base-200" 
              (keyup.enter)="add(itemInput.value)" 
              autofocus 
            />
            <button 
              (click)="add(itemInput.value)" 
              class="bg-primary hover:bg-primary/90 text-primary-content w-full py-1.5 rounded text-sm font-medium transition-colors">
              Add Item
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ActionChecklistComponent {
  // 📤 Parent ko naya checklist title bhejne ke liye
  itemAdded = output<string>(); 
  
  isOpen = signal(false);

  add(title: string) {
    if (!title.trim()) return;
    this.itemAdded.emit(title); // Emit event
    this.isOpen.set(false);     // Add hote hi popup close kardo
  }
}
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskLabel } from '../../../../core/models/task.model';

@Component({
  selector: 'app-action-label',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="relative inline-flex">
      <button 
  (click)="isOpen.set(!isOpen())" 
  [ngClass]="isOpen() ? 'bg-base-content text-base-100 hover:bg-base-content/90' : 'bg-base-100 text-base-content hover:bg-base-300'"
  class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-base-content/10">
  <mat-icon class="text-[18px] w-[18px] h-[18px]">label</mat-icon> Labels
</button>

      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>
        
        <div class="absolute top-full left-0 mt-2 w-64 bg-base-100 border border-base-content/10 shadow-2xl rounded-lg z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
          <h4 class="text-xs font-bold text-base-content/70 uppercase mb-3 text-center">Labels</h4>
          
          <div class="flex flex-col gap-2">
            @for (label of availableLabels; track label.name) {
              <div 
                (click)="onLabelClick($event, label)"
                class="relative flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                [style.backgroundColor]="label.color">
                
                <span class="text-sm font-bold text-white">{{ label.name }}</span>
                
                @if (hasLabel(label)) {
                  <mat-icon class="text-white text-[16px] w-4 h-4 font-bold">check</mat-icon>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class ActionLabelComponent {
  // 📥 Parent se aane wala data (Kaunse labels abhi lage hue hain)
  labels = input<TaskLabel[]>([]); 
  
  // 📤 Parent ko batane ke liye ki ek label click hua hai
  labelToggled = output<TaskLabel>(); 

  isOpen = signal(false);

  // Default labels (Tu chahay toh ise bhi parent se input le sakta hai)
  availableLabels: TaskLabel[] = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Enhancement', color: '#10b981' },
    { name: 'Design', color: '#a855f7' },
    { name: 'Urgent', color: '#f97316' },
    { name: 'Documentation', color: '#6b7280' }
  ];

  hasLabel(label: TaskLabel): boolean {
    return this.labels().some(l => l.name === label.name);
  }

  onLabelClick(event: Event, label: TaskLabel) {
    event.stopPropagation();
    this.labelToggled.emit(label); // Parent ko event bhej do
    // Note: Hum popup close nahi kar rahe taaki user ek sath 2-3 label tick kar sake!
  }
}
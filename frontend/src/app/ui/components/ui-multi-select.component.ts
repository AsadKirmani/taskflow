import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-multi-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full text-left" (click)="$event.stopPropagation()">
      @if (label()) {
        <label class="block text-sm font-medium text-base-content/90 mb-1.5">{{ label() }}</label>
      }
      
      <div 
        (click)="toggleOpen()"
        class="min-h-10 w-full p-1.5 bg-base-100 border border-base-content/20 rounded-btn cursor-pointer transition-colors hover:border-base-content/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary flex flex-wrap gap-1 items-center"
      >
        @if (selectedOptions().length === 0) {
          <span class="text-sm text-base-content/50 pl-2">{{ placeholder() }}</span>
        }
        
        @for (option of selectedOptions(); track option.value) {
          <span class="inline-flex items-center gap-1 px-2 py-1 bg-base-200 border border-base-content/10 rounded text-xs font-medium text-base-content">
            {{ option.label }}
            <button (click)="removeItem(option, $event)" class="hover:text-error transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </span>
        }
      </div>

      @if (isOpen()) {
        <div class="absolute z-50 mt-1 w-full bg-base-100 border border-base-content/10 rounded-box shadow-xl max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
          @for (option of options(); track option.value) {
            <label class="flex items-center gap-2.5 px-3 py-2 hover:bg-base-200 rounded-md cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                class="checkbox checkbox-sm checkbox-primary rounded" 
                [checked]="isSelected(option)"
                (change)="toggleSelection(option)"
              >
              <span class="text-sm text-base-content">{{ option.label }}</span>
            </label>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiMultiSelectComponent {
  label = input<string>();
  placeholder = input<string>('Select options...');
  options = input<{label: string, value: any}[]>([]);
  
  // Internal state
  isOpen = signal(false);
  selectedOptions = signal<{label: string, value: any}[]>([]);

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  isSelected(option: any) {
    return this.selectedOptions().some(o => o.value === option.value);
  }

  toggleSelection(option: any) {
    if (this.isSelected(option)) {
      this.selectedOptions.update(opts => opts.filter(o => o.value !== option.value));
    } else {
      this.selectedOptions.update(opts => [...opts, option]);
    }
  }

  removeItem(option: any, event: Event) {
    event.stopPropagation();
    this.selectedOptions.update(opts => opts.filter(o => o.value !== option.value));
  }
}
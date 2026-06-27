import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'ui-toggle',
  standalone: true,
  template: `
    <label class="inline-flex items-center gap-3 cursor-pointer" [class.opacity-50]="disabled()">
      
      <input 
        type="checkbox" 
        class="sr-only peer" 
        [checked]="checked()" 
        [disabled]="disabled()"
        (change)="onToggle($event)"
      >
      
      <div [class]="computedToggleClasses()"></div>
      
      @if (label()) {
        <span class="text-sm font-medium text-base-content/90 select-none">
          {{ label() }}
        </span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToggleComponent {
  label = input<string>();
  checked = input(false);
  disabled = input(false);
  size = input<'sm' | 'md'>('md');
  
  toggled = output<boolean>();

  computedToggleClasses = computed(() => {
    const base = 'relative rounded-full transition-colors duration-200 ease-in-out bg-base-300 peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:bg-primary after:content-[""] after:absolute after:bg-base-100 after:border after:border-base-content/10 after:rounded-full after:transition-all after:duration-200 peer-checked:after:border-base-100';
    
    const sizes = {
      sm: 'w-8 h-4 after:top-[2px] after:left-[2px] after:h-3 after:w-3 peer-checked:after:translate-x-4',
      md: 'w-11 h-6 after:top-[2px] after:left-[2px] after:h-5 after:w-5 peer-checked:after:translate-x-5'
    };

    return `${base} ${sizes[this.size()]}`;
  });

  onToggle(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.toggled.emit(isChecked);
  }
}
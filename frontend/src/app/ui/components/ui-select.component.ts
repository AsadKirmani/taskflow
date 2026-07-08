import {
  ChangeDetectionStrategy,
  Component,
  input,
  forwardRef,
  signal,
  computed,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1.5 w-full relative">
      @if (label()) {
        <label class="text-sm font-medium text-base-content/90">{{ label() }}</label>
      }
      <button
        type="button"
        [disabled]="disabled()"
        (click)="toggleOpen()"
        (blur)="onTouched()"
        [class]="
          'w-full h-10 pl-3 pr-10 text-left text-sm bg-base-100 border rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-base-200 disabled:cursor-not-allowed cursor-pointer ' +
          (error()
            ? 'border-error focus:ring-error/30'
            : isOpen()
            ? 'border-primary ring-2 ring-primary/20 ring-offset-1'
            : 'border-base-300 hover:border-base-content/30')
        "
      >
        <span class="block truncate" [class.text-base-content/50]="!selectedLabel()">
          {{ selectedLabel() || placeholder() || 'Select an option' }}
        </span>

        <div class="absolute top-10 right-3 flex items-center pointer-events-none text-base-content/50">
          <svg
            class="transition-transform duration-200"
            [class.rotate-180]="isOpen()"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      @if (isOpen()) {
        <div
          class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-btn shadow-lg max-h-60 overflow-auto py-1 top-full left-0 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          @for (option of options(); track option.value) {
            <label
              class="px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between hover:bg-base-200"
              [class.bg-primary]="selectedValue() === option.value"
              [class.text-primary-content]="selectedValue() === option.value"
            >
              {{ option.label }}

              <input
                type="radio"
                class="hidden"
                [name]="radioGroupName"
                [value]="option.value"
                [checked]="selectedValue() === option.value"
                (change)="onOptionSelect(option.value)"
              />

              @if (selectedValue() === option.value) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              }
            </label>
          }

          @if (options().length === 0) {
            <div class="px-3 py-4 text-sm text-center text-base-content/50">
              No options available
            </div>
          }
        </div>
      }

      @if (error()) {
        <span class="text-xs text-error font-medium mt-0.5">{{ error() }}</span>
      }
    </div>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelectComponent implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  label = input<string>();
  placeholder = input<string>();
  error = input<string>();
  disabled = input(false);
  options = input<SelectOption[]>([]);
  isOpen = signal(false);
  selectedValue = signal<any>('');

  radioGroupName = `select-group-${Math.random().toString(36).substring(2, 9)}`;

  selectedLabel = computed(() => {
    const selected = this.options().find((opt) => opt.value === this.selectedValue());
    return selected ? selected.label : '';
  });

  onChange: any = () => {};
  onTouched: any = () => {};

  toggleOpen() {
    if (!this.disabled()) {
      this.isOpen.update((v) => !v);
    }
  }

  onOptionSelect(value: any) {
    this.selectedValue.set(value);
    this.onChange(value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  writeValue(val: any): void {
    this.selectedValue.set(val);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
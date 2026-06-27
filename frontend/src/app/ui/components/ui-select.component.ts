import { ChangeDetectionStrategy, Component, input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label()) {
        <label class="text-sm font-medium text-base-content/90">{{ label() }}</label>
      }
      
      <div class="relative">
        <select
          [disabled]="disabled()"
          [ngModel]="value"
          (ngModelChange)="onValueChange($event)"
          (blur)="onTouched()"
          [class]="'w-full h-10 pl-3 pr-10 text-sm bg-base-100 border rounded-btn transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-base-200 cursor-pointer ' + (error() ? 'border-error focus:ring-error/30' : 'border-base-content/20 focus:border-primary focus:ring-primary/20')"
        >
          @if (placeholder()) {
            <option value="" disabled selected hidden>{{ placeholder() }}</option>
          }
          
          <ng-content></ng-content>
        </select>

        <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-base-content/50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      @if (error()) {
        <span class="text-xs text-error font-medium mt-0.5">{{ error() }}</span>
      }
    </div>
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelectComponent implements ControlValueAccessor {
  label = input<string>();
  placeholder = input<string>();
  error = input<string>();
  disabled = input(false);

  value: any = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  onValueChange(val: any) {
    this.value = val;
    this.onChange(val);
  }

  writeValue(val: any): void { this.value = val; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}
import { ChangeDetectionStrategy, Component, input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full text-left">
      @if (label()) {
        <label [for]="inputId" class="text-sm font-medium text-base-content/90">
          {{ label() }}
        </label>
      }
      
      <div class="relative">
        <input
          [id]="inputId"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [ngModel]="value"
          (ngModelChange)="onValueChange($event)"
          (blur)="onTouched()"
          [class]="'w-full h-10 px-3 py-2 text-sm bg-base-100 border rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-base-200 ' + (error() ? 'border-error focus:ring-error/30' : 'border-base-300 focus:border-primary focus:ring-primary/20')"
        />
      </div>

      @if (error()) {
        <span class="text-xs text-error font-medium mt-0.5">{{ error() }}</span>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputComponent implements ControlValueAccessor {
  label = input<string>();
  placeholder = input<string>('');
  type = input<'text' | 'password' | 'email' | 'number'>('text');
  error = input<string>();
  disabled = input(false);

  inputId = `ui-input-${Math.random().toString(36).substring(2, 9)}`;
  value: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  onValueChange(val: string) {
    this.value = val;
    this.onChange(val);
  }

  // ControlValueAccessor methods
  writeValue(val: any): void { this.value = val || ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { /* Handled via input signal if needed */ }
}
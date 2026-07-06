import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStoreService } from '../data-access/settings-store.service';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent],
  template: `
    <h2 class="text-lg font-semibold mb-4">Security Settings</h2>
    <form [formGroup]="securityForm" (ngSubmit)="onSubmit()" class="space-y-4 w-full max-w-md">
      <div>
        <label class="block text-sm font-medium mb-1">Current Password</label>
        <input
          formControlName="currentPassword"
          type="password"
          class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">New Password</label>
        <input
          formControlName="newPassword"
          type="password"
          class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary"
          placeholder="••••••••"
        />
        @if (
          securityForm.get('newPassword')?.hasError('minlength') &&
          securityForm.get('newPassword')?.touched
        ) {
          <span class="text-error text-xs mt-1">Password must be at least 8 characters</span>
        }
      </div>
      <ui-button
        type="submit"
        [disabled]="securityForm.invalid || store.isSaving()"
        [loading]="store.isSaving()"
        loadingText="Changing..."
        variant="danger"
        size="md"
      >
        Change Password
      </ui-button>
    </form>
  `,
})
export class SecuritySettingsComponent {
  store = inject(SettingsStoreService);
  private fb = inject(FormBuilder);

  securityForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  async onSubmit() {
    if (this.securityForm.valid) {
      const success = await this.store.updatePassword(this.securityForm.getRawValue());
      if (success) this.securityForm.reset();
    }
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStoreService } from '../data-access/settings-store.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
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
      <button
        type="submit"
        [disabled]="securityForm.invalid || store.isSaving()"
        class="bg-error text-error-content px-5 font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
      >
        @if (store.isSaving()) {
          <span class="loading loading-spinner loading-xs"></span>
        }
        Change Password
      </button>
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

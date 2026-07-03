import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStoreService } from '../data-access/settings-store.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">Edit Profile</h2>
                <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4 w-full max-w-md">
                  <div>
                    <label class="block text-sm font-medium mb-1">Full Name</label>
                    <input formControlName="name" type="text" class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary transition-colors" placeholder="John Doe" />
                    @if (profileForm.get('name')?.invalid && profileForm.get('name')?.touched) {
                      <span class="text-error text-xs mt-1">Name is required</span>
                    }
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input formControlName="email" type="email" class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                    @if (profileForm.get('email')?.invalid && profileForm.get('email')?.touched) {
                      <span class="text-error text-xs mt-1">Enter a valid email</span>
                    }
                  </div>
                  <button type="submit" [disabled]="profileForm.invalid || store.isSaving()" class="bg-primary text-primary-content px-5 font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                    @if (store.isSaving()) { <span class="loading loading-spinner loading-xs"></span> }
                    Save Changes
                  </button>
                </form>
  `
})
export class ProfileSettingsComponent {
  store = inject(SettingsStoreService);
  private fb = inject(FormBuilder);

  profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    // Jab store se data aaye, form me set kar do
    effect(() => {
      const user = this.store.profileData();
      if (user) {
        this.profileForm.patchValue({ name: user.name, email: user.email }, { emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.store.updateProfile(this.profileForm.getRawValue());
    }
  }
}
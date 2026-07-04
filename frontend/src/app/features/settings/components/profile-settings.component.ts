import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStoreService } from '../data-access/settings-store.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">Edit Profile</h2>

    <!-- Avatar Section -->
    <div class="flex items-center gap-6 mb-6">
      <div class="w-20 h-20 rounded-full bg-base-300 overflow-hidden border border-base-300">
        @if (store.profileData()?.avatarUrl) {
          <img
            [src]="store.profileData()?.avatarUrl + '?' + lastUpdated()"
            class="w-full h-full object-cover"
            alt="Profile"
          />
        } @else {
          <div class="w-full h-full flex items-center justify-center text-base-content/50">
            <svg lucideUser class="w-10 h-10"></svg>
          </div>
        }
      </div>

      <div class="flex flex-col gap-2">
        <button
          (click)="fileInput.click()"
          class="text-sm font-medium px-4 py-2 bg-base-200 hover:bg-base-300 rounded-lg transition-colors border border-base-300"
        >
          Change Avatar
        </button>
        <input
          type="file"
          #fileInput
          class="hidden"
          (change)="onFileSelected($event)"
          accept="image/*"
        />
        <p class="text-xs text-base-content/60">JPG, PNG or GIF. Max 2MB.</p>
      </div>
    </div>

    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4 w-full max-w-md">
      <div>
        <label class="block text-sm font-medium mb-1">Full Name</label>
        <input
          formControlName="name"
          type="text"
          class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary transition-colors"
          placeholder="John Doe"
        />
        @if (profileForm.get('name')?.invalid && profileForm.get('name')?.touched) {
          <span class="text-error text-xs mt-1">Name is required</span>
        }
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input
          formControlName="email"
          type="email"
          class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary transition-colors"
          placeholder="john@example.com"
        />

        @if (profileForm.get('email')?.invalid && profileForm.get('email')?.touched) {
          <span class="text-error text-xs mt-1">Enter a valid email</span>
        }
      </div>
      <button
        type="submit"
        [disabled]="profileForm.invalid || store.isSaving()"
        class="bg-primary text-primary-content px-5 font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
      >
        @if (store.isSaving()) {
          <span class="loading loading-spinner loading-xs"></span>
        }
        Save Changes
      </button>
    </form>
  `,
})
export class ProfileSettingsComponent {
  store = inject(SettingsStoreService);
  private fb = inject(FormBuilder);

  profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    avatarUrl: [''],
  });
  lastUpdated = signal(Date.now());

  constructor() {
    effect(() => {
      const user = this.store.profileData();
      if (user) {
        // avatarUrl ko bhi patchValue mein include kar diya
        this.profileForm.patchValue(
          {
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          { emitEvent: false },
        );
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.store.updateProfile(this.profileForm.getRawValue());
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.store.uploadAvatar(file).then((avatarUrl) => {
        if (avatarUrl) {
          this.lastUpdated.set(Date.now()); // Avatar update hone ke baad lastUpdated ko update karo
        }
      });
    }
  }
}

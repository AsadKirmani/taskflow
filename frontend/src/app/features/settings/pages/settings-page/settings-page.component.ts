import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ThemeToggleComponent } from '../../components/app-theme-toggle.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeToggleComponent],
  template: `
    <section>
      <div class="text-base-content">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>

        <div class="bg-base-200 rounded-xl border border-base-content/20 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          
          <nav class="flex flex-row overflow-x-auto gap-2 border-b border-base-content/20 bg-base-300 p-4">
            <button (click)="setTab('profile')" [class.bg-base-200]="activeTab() === 'profile'" [class.font-semibold]="activeTab() === 'profile'" [class.shadow-sm]="activeTab() === 'profile'" class="px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100 whitespace-nowrap">
              Profile
            </button>
            <button (click)="setTab('security')" [class.bg-base-200]="activeTab() === 'security'" [class.font-semibold]="activeTab() === 'security'" [class.shadow-sm]="activeTab() === 'security'" class="px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100 whitespace-nowrap">
              Security
            </button>
            <button (click)="setTab('notifications')" [class.bg-base-200]="activeTab() === 'notifications'" [class.font-semibold]="activeTab() === 'notifications'" [class.shadow-sm]="activeTab() === 'notifications'" class="px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100 whitespace-nowrap">
              Notifications
            </button>
            <button (click)="setTab('preferences')" [class.bg-base-200]="activeTab() === 'preferences'" [class.font-semibold]="activeTab() === 'preferences'" [class.shadow-sm]="activeTab() === 'preferences'" class="px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100 whitespace-nowrap">
              Preferences
            </button>
          </nav>

          <main class="flex-1 p-8 relative">
            
            @if (isLoading()) {
              <div class="absolute inset-0 bg-base-200/50 flex items-center justify-center z-10">
                <span class="loading loading-spinner loading-md text-primary"></span>
              </div>
            }

            @switch (activeTab()) {
              
              @case ('profile') {
                <h2 class="text-lg font-semibold mb-4">Edit Profile</h2>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4 w-full max-w-md">
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
                  <button type="submit" [disabled]="profileForm.invalid || isSaving()" class="bg-primary text-primary-content px-5 font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                    @if (isSaving()) { <span class="loading loading-spinner loading-xs"></span> }
                    Save Changes
                  </button>
                </form>
              }

              @case ('security') {
                <h2 class="text-lg font-semibold mb-4">Security Settings</h2>
                <form [formGroup]="securityForm" (ngSubmit)="updatePassword()" class="space-y-4 w-full max-w-md">
                  <div>
                    <label class="block text-sm font-medium mb-1">Current Password</label>
                    <input formControlName="currentPassword" type="password" class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary" placeholder="••••••••" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">New Password</label>
                    <input formControlName="newPassword" type="password" class="w-full border border-base-300 bg-base-100 rounded-lg p-2.5 focus:outline-none focus:border-primary" placeholder="••••••••" />
                    @if (securityForm.get('newPassword')?.hasError('minlength') && securityForm.get('newPassword')?.touched) {
                      <span class="text-error text-xs mt-1">Password must be at least 6 characters</span>
                    }
                  </div>
                  <button type="submit" [disabled]="securityForm.invalid || isSaving()" class="bg-error text-error-content px-5 font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                    @if (isSaving()) { <span class="loading loading-spinner loading-xs"></span> }
                    Change Password
                  </button>
                </form>
              }

              @case ('notifications') {
                <h2 class="text-lg font-semibold mb-4">Notification Preferences</h2>
                <form [formGroup]="notificationsForm" (ngSubmit)="updateNotifications()" class="space-y-4 w-full max-w-md">
                  <div class="flex items-center justify-between p-3 border border-base-300 rounded-lg bg-base-100">
                    <div>
                      <h3 class="font-medium text-sm">Email Alerts</h3>
                      <p class="text-xs text-base-content/70">Receive daily task summaries</p>
                    </div>
                    <input type="checkbox" formControlName="emailAlerts" class="toggle toggle-primary" />
                  </div>
                  <div class="flex items-center justify-between p-3 border border-base-300 rounded-lg bg-base-100">
                    <div>
                      <h3 class="font-medium text-sm">Push Notifications</h3>
                      <p class="text-xs text-base-content/70">Get notified when mentioned</p>
                    </div>
                    <input type="checkbox" formControlName="pushNotifications" class="toggle toggle-primary" />
                  </div>
                  <button type="submit" [disabled]="isSaving()" class="bg-primary text-primary-content px-5 font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                    @if (isSaving()) { <span class="loading loading-spinner loading-xs"></span> }
                    Save Preferences
                  </button>
                </form>
              }

              @case ('preferences') {
                <h2 class="text-lg font-semibold mb-4">Theme & Display</h2>
                <div class="p-4 border border-base-300 rounded-lg bg-base-100 max-w-md flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-sm">App Theme</h3>
                    <p class="text-xs text-base-content/70">Toggle light/dark mode</p>
                  </div>
                  <app-theme-toggle></app-theme-toggle>
                </div>
              }
            }
          </main>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private http = inject(HttpClient); // Tu isko apne UserService se replace kar sakta hai

  // Signals for state management
  activeTab = signal<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  isLoading = signal(true);
  isSaving = signal(false);

  // 🚀 Form Builders
  profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  securityForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  notificationsForm = this.fb.nonNullable.group({
    emailAlerts: [true],
    pushNotifications: [false],
  });

  ngOnInit() {
    this.loadUserSettings();
  }

  setTab(tab: 'profile' | 'security' | 'notifications' | 'preferences') {
    this.activeTab.set(tab);
  }

  // --- API Calls (Update endpoints to match your backend) ---

  async loadUserSettings() {
    this.isLoading.set(true);
    try {
      // 💡 Replace with your actual user details fetch API
      const res = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/auth/me`));
      const user = res.data.user;
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fake Response
      
      this.profileForm.patchValue({ name: user.name, email: user.email });
      //this.notificationsForm.patchValue({ emailAlerts: user.emailAlerts, pushNotifications: user.pushNotifications });
    } catch (error) {
      this.notification.error('Failed to load settings');
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateProfile() {
    if (this.profileForm.invalid) return;
    this.isSaving.set(true);

    try {
      // 💡 Replace with your actual update API
      await firstValueFrom(this.http.patch(`${environment.apiUrl}/auth/update-profile`, this.profileForm.getRawValue()));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      this.notification.success('Profile updated successfully!');
    } catch (error) {
      this.notification.error('Failed to update profile');
    } finally {
      this.isSaving.set(false);
    }
  }

  async updatePassword() {
    if (this.securityForm.invalid) return;
    this.isSaving.set(true);

    try {
      // 💡 Replace with your actual password change API
      await firstValueFrom(this.http.patch(`${environment.apiUrl}/auth/reset-password`, this.securityForm.getRawValue()));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      this.notification.success('Password changed successfully!');
      this.securityForm.reset();
    } catch (error) {
      this.notification.error('Failed to change password. Check your current password.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateNotifications() {
    this.isSaving.set(true);

    try {
      // 💡 Replace with your actual notification update API
      // await firstValueFrom(this.http.patch(`${environment.apiUrl}/users/me/notifications`, this.notificationsForm.getRawValue()));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      this.notification.success('Notification preferences saved!');
    } catch (error) {
      this.notification.error('Failed to save preferences');
    } finally {
      this.isSaving.set(false);
    }
  }
  async updatePreferences() {
    this.isSaving.set(true);
    try {
      // 💡 Replace with your actual preferences update API
      // await firstValueFrom(this.http.patch(`${environment.apiUrl}/auth/update-profile`, this.preferencesForm.getRawValue()));


      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      this.notification.success('Preferences saved!');
    }
    catch (error) {
      this.notification.error('Failed to save preferences');
    }
    finally {
      this.isSaving.set(false);
    }
  }

}
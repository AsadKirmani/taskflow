import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStoreService } from '../data-access/settings-store.service';

@Component({
  selector: 'app-notifications-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
   <h2 class="text-lg font-semibold mb-4">Notification Preferences</h2>
                <form [formGroup]="notificationsForm" class="space-y-4 w-full max-w-md">
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
                  <button type="submit" [disabled]="store.isSaving()" class="bg-primary text-primary-content px-5 font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                    @if (store.isSaving()) { <span class="loading loading-spinner loading-xs"></span> }
                    Save Preferences
                  </button>
                </form>
  `
})
export class NotificationsSettingsComponent {
  store = inject(SettingsStoreService);
  private fb = inject(FormBuilder);

  notificationsForm = this.fb.nonNullable.group({
    emailAlerts: [false],
    pushNotifications: [false],
  });

//   async updateNotifications() {
//     if (this.notificationsForm.valid) {
//       const success = await this.store.updateNotifications(this.notificationsForm.getRawValue());
//       if (success) this.notificationsForm.reset();
//     }
//   }
}
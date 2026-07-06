import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStoreService } from '../data-access/settings-store.service';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiToggleComponent } from '../../../ui/components/ui-toggle.component';

@Component({
  selector: 'app-notifications-settings',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent, UiToggleComponent],
  template: `
    <h2 class="text-lg font-semibold mb-4">Notification Preferences</h2>
    <form [formGroup]="notificationsForm" class="space-y-4 w-full max-w-md">
      <div
        class="flex items-center justify-between p-3 border border-base-300 rounded-lg bg-base-100"
      >
        <div>
          <h3 class="font-medium text-sm">Email Alerts</h3>
          <p class="text-xs text-base-content/70">Receive daily task summaries</p>
        </div>
        <ui-toggle></ui-toggle>
      </div>
      <div
        class="flex items-center justify-between p-3 border border-base-300 rounded-lg bg-base-100"
      >
        <div>
          <h3 class="font-medium text-sm">Push Notifications</h3>
          <p class="text-xs text-base-content/70">Get notified when mentioned</p>
        </div>
        <ui-toggle></ui-toggle>
      </div>
      <ui-button
        type="submit"
        variant="primary"
        size="md"
        [disabled]="store.isSaving()"
        [loading]="store.isSaving()"
        loadingText="Saving..."
      >
        Save Preferences
      </ui-button>
    </form>
  `,
})
export class NotificationsSettingsComponent {
  store = inject(SettingsStoreService);
  private fb = inject(FormBuilder);

  notificationsForm = this.fb.nonNullable.group({
    emailAlerts: [false],
    pushNotifications: [false],
  });
}

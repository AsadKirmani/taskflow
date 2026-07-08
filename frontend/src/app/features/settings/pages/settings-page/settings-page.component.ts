import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ThemeToggleComponent } from '../../components/app-theme-toggle.component';
import { SettingsStoreService } from '../../data-access/settings-store.service';
import { ProfileSettingsComponent } from '../../components/profile-settings.component';
import { SecuritySettingsComponent } from '../../components/security-settings.component';
import { NotificationsSettingsComponent } from '../../components/notifications-settings.component';
import { UiTabComponent } from '../../../../ui/components/ui-tab.component';
import { UiTabsComponent } from '../../../../ui/components/ui-tabs.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    ThemeToggleComponent,
    ProfileSettingsComponent,
    SecuritySettingsComponent,
    NotificationsSettingsComponent,
    UiTabsComponent,
    UiTabComponent
  ],
  template: `
    <section>
      <div class="text-base-content">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>
          <ui-tabs variant="boxed" size="md" (tabChange)="onTabChange($event)">
            <ui-tab label="Profile">
                <app-profile-settings />
                </ui-tab>
                <ui-tab label="Security">
                  <app-security-settings />
                </ui-tab>
                <ui-tab label="Notifications">
                  <app-notifications-settings />
                </ui-tab>
                <ui-tab label="Preferences">
                  <div>
                    <h2 class="text-lg font-semibold mb-4">Theme & Display</h2>
                    <div
                      class="p-4 border border-base-300 rounded-lg bg-base-100 max-w-md flex items-center justify-between"
                  >
                    <div>
                      <h3 class="font-medium text-sm">App Theme</h3>
                      <p class="text-xs text-base-content/70">Toggle light/dark mode</p>
                    </div>
                    <app-theme-toggle></app-theme-toggle>
                  </div>
                </div>
            </ui-tab>
          </ui-tabs>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent implements OnInit {
  store = inject(SettingsStoreService);
  activeTab = signal<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  tabLabels = ['profile', 'security', 'notifications', 'preferences'] as const;
  onTabChange(index: number) {
    this.activeTab.set(this.tabLabels[index]);
  }

  ngOnInit() {
    this.store.loadProfile();
  }
}

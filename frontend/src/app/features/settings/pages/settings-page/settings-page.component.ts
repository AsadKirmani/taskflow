import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ThemeToggleComponent } from '../../components/app-theme-toggle.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [ThemeToggleComponent],
  template: `
    <section>
      <div class="text-base-content">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>

        <div
          class="bg-base-200 rounded-xl border border-base-content/20 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]"
        >
          <aside
            class="w-full md:w-64 border-b md:border-b-0 md:border-r border-base-200/20 bg-base-300 p-4 space-y-1"
          >
            <button
              (click)="setTab('profile')"
              [class]="activeTab() === 'profile' ? 'bg-base-200 shadow-sm font-semibold' : ''"
              class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100"
            >
              Profile
            </button>
            <button
              (click)="setTab('security')"
              [class]="activeTab() === 'security' ? 'bg-base-200 shadow-sm font-semibold' : ''"
              class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100"
            >
              Security
            </button>
            <button
              (click)="setTab('notifications')"
              [class]="activeTab() === 'notifications' ? 'bg-base-200 shadow-sm font-semibold' : ''"
              class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100"
            >
              Notifications
            </button>
            <button
              (click)="setTab('preferences')"
              [class]="activeTab() === 'preferences' ? 'bg-base-200 shadow-sm font-semibold' : ''"
              class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100"
            >
              Preferences
            </button>
          </aside>

          <main class="flex-1 p-8">
            @switch (activeTab()) {
              @case ('profile') {
                <h2 class="text-lg font-semibold mb-4">Edit Profile</h2>
                <div class="space-y-4 w-full max-w-md">
                  <div>
                    <label class="block text-sm font-medium">Full Name</label
                    ><input
                      class="w-full border rounded-lg p-2 mt-1"
                      type="text"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium">Email</label
                    ><input
                      class="w-full border rounded-lg p-2 mt-1"
                      type="email"
                      placeholder="john@example.com"
                    />
                  </div>
                  <button class="bg-primary text-base-300 px-4 font-medium py-2 rounded-lg">Save Changes</button>
                </div>
              }
              @case ('security') {
                <h2 class="text-lg font-semibold mb-4">Security Settings</h2>
                <button class="text-blue-600 font-medium text-sm underline">Change Password</button>
              }
              @case ('preferences') {
                <h2 class="text-lg font-semibold mb-4">Theme Preferences</h2>
                <app-theme-toggle></app-theme-toggle>
              }
              @default {
                <p class="text-lg font-semibold">Settings for {{ activeTab() }} are coming soon!</p>
              }
            }
          </main>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  activeTab = signal<'profile' | 'security' | 'notifications' | 'preferences'>('profile');

  setTab(tab: 'profile' | 'security' | 'notifications' | 'preferences') {
    this.activeTab.set(tab);
  }
}

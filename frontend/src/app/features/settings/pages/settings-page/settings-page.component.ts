import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  template: `
    <section>
     <div class="p-6 max-w-4xl mx-auto h-full overflow-y-auto">
  <h1 class="text-2xl font-bold text-stone-900 mb-6">Settings</h1>

  <div class="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
    
    <aside class="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-200 bg-stone-50 p-4 space-y-1">
      <button (click)="setTab('profile')" [class]="activeTab() === 'profile' ? 'bg-white shadow-sm font-semibold' : ''" class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all">Profile</button>
      <button (click)="setTab('security')" [class]="activeTab() === 'security' ? 'bg-white shadow-sm font-semibold' : ''" class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all">Security</button>
      <button (click)="setTab('notifications')" [class]="activeTab() === 'notifications' ? 'bg-white shadow-sm font-semibold' : ''" class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all">Notifications</button>
      <button (click)="setTab('preferences')" [class]="activeTab() === 'preferences' ? 'bg-white shadow-sm font-semibold' : ''" class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all">Preferences</button>
    </aside>

    <main class="flex-1 p-8">
      @switch (activeTab()) {
        @case ('profile') {
          <h2 class="text-lg font-semibold mb-4">Edit Profile</h2>
          <div class="space-y-4">
            <div><label class="block text-sm font-medium">Full Name</label><input class="w-full border rounded-lg p-2 mt-1" type="text" placeholder="John Doe"></div>
            <div><label class="block text-sm font-medium">Email</label><input class="w-full border rounded-lg p-2 mt-1" type="email" placeholder="john@example.com"></div>
            <button class="bg-stone-900 text-white px-4 py-2 rounded-lg">Save Changes</button>
          </div>
        }
        @case ('security') {
          <h2 class="text-lg font-semibold mb-4">Security Settings</h2>
          <button class="text-blue-600 font-medium text-sm underline">Change Password</button>
        }
        @default {
          <p class="text-stone-500">Settings for {{ activeTab() }} are coming soon!</p>
        }
      }
    </main>
  </div>
</div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {
  activeTab = signal<'profile' | 'security' | 'notifications' | 'preferences'>('profile');

  setTab(tab: 'profile' | 'security' | 'notifications' | 'preferences') {
    this.activeTab.set(tab);
  }
}
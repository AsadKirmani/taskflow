import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../../components/app-theme-toggle.component';
import { SettingsStoreService } from '../../data-access/settings-store.service';
import { ProfileSettingsComponent } from '../../components/profile-settings.component';
import { SecuritySettingsComponent } from '../../components/security-settings.component';
import { NotificationsSettingsComponent } from '../../components/notifications-settings.component';
// Import your other tabs here...

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule, 
    ThemeToggleComponent, 
    ProfileSettingsComponent, 
    SecuritySettingsComponent,
    NotificationsSettingsComponent
  ],
  template: `
    <section>
      <div class="text-base-content">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>

        <div class="bg-base-100 rounded-box border border-base-300 overflow-hidden flex flex-col min-h-[500px]">
          
          <!-- Tabs Navigation -->
          <nav class="flex flex-row overflow-x-auto gap-2 border-b border-base-300 bg-base-300 p-4">
            @for (tab of tabs; track tab.id) {
              <button 
                (click)="activeTab.set(tab.id)" 
                [class.bg-base-200]="activeTab() === tab.id" 
                [class.font-semibold]="activeTab() === tab.id" 
                [class.shadow-sm]="activeTab() === tab.id" 
                class="px-4 py-2 rounded-lg text-sm transition-all hover:bg-base-100 whitespace-nowrap">
                {{ tab.label }}
              </button>
            }
          </nav>

          <!-- Main Content Area -->
          <main class="flex-1 p-8 relative">
            
            @if (store.loading()) {
              <div class="absolute inset-0 bg-base-200/50 flex items-center justify-center z-10">
                <span class="loading loading-spinner loading-md text-primary"></span>
              </div>
            } @else {
              
              @switch (activeTab()) {
                @case ('profile') { <app-profile-settings /> }
                @case ('security') { <app-security-settings /> }
                @case ('notifications') { <app-notifications-settings /> }
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
            }
          </main>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent implements OnInit {
  store = inject(SettingsStoreService);
  
  tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Preferences' }
  ];
  
  activeTab = signal<string>('profile');

  ngOnInit() {
    this.store.loadProfile(); // Component load hote hi data fetch karega
  }
}
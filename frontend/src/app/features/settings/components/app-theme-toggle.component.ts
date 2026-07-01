import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, AppTheme } from '../../../core/services/theme.service';
import { APP_ICONS } from '../../../core/icons/lucide-icons';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ...APP_ICONS],
  template: `
    <div class="flex items-center p-1 space-x-1 bg-base-300 border border-base-300 rounded-box shadow-sm justify-between w-max">
      
      <button
        (click)="setTheme('light')"
        [class.bg-base-100]="currentTheme() === 'light'"
        [class.text-primary]="currentTheme() === 'light'"
        [class.shadow-sm]="currentTheme() === 'light'"
        class="flex items-center justify-center w-8 h-8 hover:bg-base-100 rounded-field text-base-content/60 hover:text-base-content transition-all focus:outline-none cursor-pointer border-none bg-transparent"
        title="Light Mode"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>
</svg>

      </button>

      <button
        (click)="setTheme('system')"
        [class.bg-base-100]="currentTheme() === 'system'"
        [class.text-primary]="currentTheme() === 'system'"
        [class.shadow-sm]="currentTheme() === 'system'"
        class="flex items-center justify-center w-8 h-8 hover:bg-base-100 rounded-field text-base-content/60 hover:text-base-content transition-all focus:outline-none cursor-pointer border-none bg-transparent"
        title="System Auto"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v5m-3 0h6M4 11h16M5 15h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1Z"/>
</svg>

      </button>

      <button
        (click)="setTheme('dark')"
        [class.bg-base-100]="currentTheme() === 'dark'"
        [class.text-primary]="currentTheme() === 'dark'"
        [class.shadow-sm]="currentTheme() === 'dark'"
        class="flex items-center justify-center w-8 h-8 hover:bg-base-100 rounded-field text-base-content/60 hover:text-base-content transition-all focus:outline-none cursor-pointer border-none bg-transparent"
        title="Dark Mode"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 0 1-.5-17.986V3c-.354.966-.5 1.911-.5 3a9 9 0 0 0 9 9c.239 0 .254.018.488 0A9.004 9.004 0 0 1 12 21Z"/>
</svg>

      </button>

    </div>
  `
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  currentTheme = this.themeService.currentTheme;

  setTheme(theme: AppTheme) {
    this.themeService.setTheme(theme);
  }
}
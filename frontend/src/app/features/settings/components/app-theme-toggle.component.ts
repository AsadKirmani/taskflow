import { Component, inject } from '@angular/core';
import { ThemeService, AppTheme } from '../../../core/services/theme.service';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [UiButtonComponent, ...APP_ICONS],
  template: `
    <div
      class="flex items-center p-2 space-x-1 bg-base-300 border border-base-300 rounded-box shadow-sm justify-between w-max"
    >
      <ui-button
        variant="icon"
        size="icon-sm"
        (click)="setTheme('light')"
        [active]="currentTheme() === 'light'"
        title="Light Mode"
      >
        <svg lucideSun class="w-4 h-4" aria-hidden="true"></svg>
      </ui-button>

      <ui-button
        variant="icon"
        size="icon-sm"
        (click)="setTheme('system')"
        [active]="currentTheme() === 'system'"
        title="System Auto"
      >
        <svg lucideMonitor class="w-4 h-4" aria-hidden="true"></svg>
      </ui-button>

      <ui-button
        variant="icon"
        size="icon-sm"
        (click)="setTheme('dark')"
        [active]="currentTheme() === 'dark'"
        title="Dark Mode"
      >
        <svg lucideMoon class="w-4 h-4" aria-hidden="true"></svg>
      </ui-button>
    </div>
  `,
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  currentTheme = this.themeService.currentTheme;

  setTheme(theme: AppTheme) {
    this.themeService.setTheme(theme);
  }
}

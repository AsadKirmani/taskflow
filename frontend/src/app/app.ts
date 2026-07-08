import { Component, signal, OnInit, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { AuthStoreService } from './features/auth/data-access/auth-store.service';
import { KeyboardShortcutsService } from './core/services/keyboard-shortcuts.service';
import { DashboardStore } from './features/dashboard/data-access/dashboard-store.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('Taskflow');
  private themeService = inject(ThemeService);
  private authStore = inject(AuthStoreService);
  private dashboardStore = inject(DashboardStore);
  private shortcuts = inject(KeyboardShortcutsService);

  ngOnInit(): void {
    this.themeService.setTheme(this.themeService.currentTheme());
    this.authStore.initializeSession().subscribe();
  }
  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    const isTyping = ['input', 'textarea'].includes(
      document.activeElement?.tagName.toLowerCase() || '',
    );
    if (isTyping) return;

    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.shortcuts.triggerSearch();
    }

    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.shortcuts.triggerCreate();
    }
    if ((event.shiftKey || event.metaKey) && event.key.toLowerCase() === 't') {
      event.preventDefault();
      const activeColumnId = this.shortcuts.activeColumnId;
      this.shortcuts.triggerAddTask(activeColumnId || undefined);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.shortcuts.triggerEscape();
    }
  }
}

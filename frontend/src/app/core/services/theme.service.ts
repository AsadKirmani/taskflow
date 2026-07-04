import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme = signal<AppTheme>((localStorage.getItem('taskflow_theme') as AppTheme) || 'system');

  constructor() {
    effect(() => {
      this.applyTheme(this.currentTheme());
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme() === 'system') {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newSystemTheme);
      }
    });
  }

  private applyTheme(theme: AppTheme) {
    let resolvedTheme = theme;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = prefersDark ? 'dark' : 'light';
      localStorage.removeItem('taskflow_theme');
    } else {
      localStorage.setItem('taskflow_theme', theme);
    }

    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
  }

  toggleTheme() {
    const current = this.currentTheme();
    const nextTheme: AppTheme = current === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }
}

import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<AppTheme>(
    (localStorage.getItem('taskflow_theme') as AppTheme) || 'light'
  );

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('taskflow_theme', theme);
    });
  }
  toggleTheme() {
    this.currentTheme.update(theme => theme === 'light' ? 'dark' : 'light');
  }
  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
  }
}

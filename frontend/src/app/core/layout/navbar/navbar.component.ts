import { ChangeDetectionStrategy, Component, EventEmitter, Output , HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { UserMenuComponent } from './usermenu.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, UserMenuComponent, CommonModule],
  template: `
    <header class="sticky top-0 z-10 bg-gray-50 text-white p-4">
    <div class="flex flex-col gap-3 flex-row items-center justify-between">
    <div class="flex w-full items-center gap-2 sm:w-auto">
      <button type="button" aria-label="Toggle sidebar" (click)="menuToggle.emit()" class="flex items-center justify-center text-gray-800 hover:bg-gray-200 rounded p-1 shrink-0">
        <mat-icon style="">dock_to_right</mat-icon>
      </button>
      <span class=" text-gray-200 w-0.5 h-6 bg-gray-200"></span>
      <div class="relative rounded-full bg-white text-gray-200 flex sm:flex-none w-26 sm:w-64 md:w-80">
        <mat-icon class="absolute left-2 top-1/2 transform -translate-y-1/2">search</mat-icon>
        <input type="text" placeholder="Search tasks..." class="w-full sm:w-64 md:w-80 pl-8 pr-4 py-2 rounded-full placeholder:text-gray-500 placeholder:italic border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    </div>
    
    <div class="flex items-center justify-end gap-2">
    <button 
  (click)="themeService.toggleTheme()" 
  class="p-2 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center"
  title="Toggle Theme"
>
  @if (themeService.currentTheme() === 'light') {
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
    </svg>
  } @else {
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>
  }
</button>

    <button type="button" aria-label="Notifications" class="flex items-center justify-center bg-white text-gray-600 w-10 h-10 rounded-full hover:bg-gray-200">
        <mat-icon>notifications</mat-icon>
        </button>
      <div class="relative group">
        <button type="button" aria-label="User profile" class="flex items-center justify-center bg-white text-gray-600 w-10 h-10 rounded-full hover:bg-gray-200" (click)="toggleUserMenu($event)">
          <mat-icon>account_circle</mat-icon>
        </button>
        <app-user-menu *ngIf="isUserMenuOpen" (logout)="logout()"></app-user-menu>
      </div>
    </div>
    </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  public themeService = inject(ThemeService);
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();
  isUserMenuOpen = false;
  constructor(private authStore: AuthStoreService) {}
  logout() {
    this.authStore.logout();
  }
  toggleUserMenu(event?: MouseEvent) {
    event?.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  @HostListener('document:click', ['$event'])
  closeUserMenu(event: MouseEvent) {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }
}

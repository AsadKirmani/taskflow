import { ChangeDetectionStrategy, Component, EventEmitter, Output , HostListener, inject, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { UserMenuComponent } from './usermenu.component';
import { ThemeService } from '../../services/theme.service';
import { SearchOverlayComponent } from '../../../shared/components/search/search-overlay.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, UserMenuComponent, CommonModule, SearchOverlayComponent],
  template: `
    <header class="sticky top-0 z-10 bg-base-100 p-4">
    <div class="flex flex-col gap-3 flex-row items-center justify-between">
    <div class="flex w-full items-center gap-2 sm:w-auto">
      <button type="button" aria-label="Toggle sidebar" (click)="menuToggle.emit()" class="p-2 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center shrink-0">
       <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/>
</svg>


      </button>
      <span class="text-base-content/50 w-0.5 h-6 bg-base-content/50"></span>
      <div class="relative rounded-full bg-base-100 text-base-content/50 flex sm:flex-none w-24 sm:w-64 md:w-80" (click)="searchOverlay.openSearch()">
        <svg class="w-6 h-6 absolute left-2 top-1/2 transform -translate-y-1/2 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
</svg>

        <input type="text" placeholder="Search tasks..." class="w-full sm:w-64 md:w-80 pl-8 pr-4 py-2 rounded-full placeholder:text-base-content/50 placeholder:italic border border-base-content/30 focus:outline-none focus:ring-2 focus:ring-accent/30 hover:border-accent focus:border-accent transition-colors bg-transparent text-base-content" />
      </div>
    </div>
    
    <div class="flex items-center justify-end gap-2">
    <button 
  (click)="themeService.toggleTheme()" 
  class="p-2 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center border border-base-content/30"
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

    <button type="button" aria-label="Notifications" class="p-2 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center border border-base-content/30">
       <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z"/>
</svg>

        </button>
      <div class="relative group">
        <button type="button" aria-label="User profile" class="p-2 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center border border-base-content/30" (click)="toggleUserMenu($event)">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
</svg>

        </button>
        <app-user-menu *ngIf="isUserMenuOpen" (logout)="logout()"></app-user-menu>
      </div>
    </div>
    </div>
    <app-search-overlay #searchOverlay></app-search-overlay>
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
  @ViewChild('searchOverlay') searchOverlay!: SearchOverlayComponent;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchOverlay.openSearch();
    }
  }
}

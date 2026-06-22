import { ChangeDetectionStrategy, Component, EventEmitter, Output , HostListener, inject, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { UserMenuComponent } from './usermenu.component';
import { ThemeService } from '../../services/theme.service';
import { SearchOverlayComponent } from '../../../shared/components/search/search-overlay.component';
import { AvatarComponent } from '../../../shared/components/avatar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, UserMenuComponent, CommonModule, SearchOverlayComponent, AvatarComponent],
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
    <mat-icon>dark_mode</mat-icon>
    } @else {
      <mat-icon>light_mode</mat-icon>
  }
</button>

    <button type="button" aria-label="Notifications" class="p-2 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center border border-base-content/30">
     <mat-icon>notifications_none</mat-icon>
        </button>
      <div class="relative group">
        <button type="button" aria-label="User profile" class=" rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center border border-base-content/30" (click)="toggleUserMenu($event)">
        <app-avatar [name]="authStore.currentUser()!.name" [title]="authStore.currentUser()!.name"></app-avatar>

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
  authStore = inject(AuthStoreService);
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

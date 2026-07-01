import { ChangeDetectionStrategy, Component, EventEmitter, Output , HostListener, inject, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { UserMenuComponent } from './usermenu.component';
import { ThemeService } from '../../services/theme.service';
import { SearchOverlayComponent } from '../../../shared/components/search/search-overlay.component';
import { AvatarComponent } from '../../../shared/components/avatar.component';
import { APP_ICONS } from '../../icons/lucide-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [UserMenuComponent, CommonModule, SearchOverlayComponent, AvatarComponent, ...APP_ICONS],
  template: `
    <header class="sticky top-0 z-10 bg-base-200/70 p-4 backdrop-blur-lg border-b border-base-300">
    <div class="flex flex-col gap-3 flex-row items-center justify-between">
    <div class="flex w-full items-center gap-2 sm:w-auto">
      <button type="button" aria-label="Toggle sidebar" (click)="menuToggle.emit()" class="p-2 rounded-full bg-base-100 text-base-content transition-colors hover:bg-base-300 flex items-center justify-center shrink-0">
      <svg lucideChevronRight></svg>
      </button>
      <span class="w-0.5 h-6 bg-base-300"></span>
      <div class="relative rounded-full bg-base-100 text-base-content/50 flex sm:flex-none w-24 sm:w-64 md:w-80" (click)="searchOverlay.openSearch()">
        <svg lucideSearch class="w-6 h-6 absolute left-2 top-1/2 transform -translate-y-1/2"></svg>
        <input type="text" placeholder="Search tasks..." class="w-full sm:w-64 md:w-80 pl-8 pr-4 py-2 rounded-full placeholder:text-base-content/50 placeholder:italic border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary focus:border-primary transition-colors bg-transparent text-base-content" />
      </div>
    </div>
    
    <div class="flex items-center justify-end gap-2">
    <button 
  (click)="themeService.toggleTheme()" 
  class="p-2 rounded-full hover:bg-base-300 bg-base-100 text-base-content hover:text-primary transition-colors flex items-center justify-center border border-base-300"
  title="Toggle Theme"
>
  @if (themeService.currentTheme() === 'light') {
    <svg lucideMoon></svg>
    } @else {
      <svg lucideSun></svg>
  }
</button>

    <button type="button" aria-label="Notifications" class="p-2 rounded-full hover:bg-base-300 text-base-content bg-base-100 hover:text-primary transition-colors flex items-center justify-center border border-base-300">
     <svg lucideBell></svg>
        </button>
      <div class="relative group">
        <button type="button" aria-label="User profile" class=" rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors flex items-center justify-center border border-base-300" (click)="toggleUserMenu($event)">
        <app-avatar [name]="authStore.currentUser()!.name" [title]="authStore.currentUser()!.name"></app-avatar>
        </button>
        <app-user-menu *ngIf="isUserMenuOpen" (logout)="logout()"></app-user-menu>
      </div>
    </div>
    </div>
    </header>
    <app-search-overlay #searchOverlay></app-search-overlay>
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

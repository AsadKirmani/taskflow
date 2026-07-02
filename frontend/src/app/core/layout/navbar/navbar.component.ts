import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { ThemeService } from '../../services/theme.service';
import { SearchOverlayComponent } from '../../../shared/components/search/search-overlay.component';
import { AvatarComponent } from '../../../shared/components/avatar.component';
import { APP_ICONS } from '../../icons/lucide-icons';
import {
  UiDropdownMenuComponent,
  UiDropdownMenuContent,
  UiDropdownMenuTrigger,
} from '../../../ui/components/ui-dropdown-menu.component';
import { UiDropdownMenuItemComponent } from '../../../ui/components/ui-dropdown-menu-item.component';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    SearchOverlayComponent,
    AvatarComponent,
    UiButtonComponent,
    UiDropdownMenuComponent,
    UiDropdownMenuTrigger,
    UiDropdownMenuContent,
    UiDropdownMenuItemComponent,
    ...APP_ICONS,
  ],
  template: `
    <header class="sticky top-0 z-10 bg-base-200/70 p-4 backdrop-blur-lg border-b border-base-300">
      <div class="flex flex-col gap-3 flex-row items-center justify-between">
        <div class="flex w-full items-center gap-2 sm:w-auto">
          <ui-button
            variant="icon"
            size="icon"
            aria-label="Toggle sidebar"
            (click)="menuToggle.emit()"
            title="Toggle sidebar"
          >
            <svg lucideChevronRight></svg>
          </ui-button>
          <span class="w-0.5 h-6 bg-base-300"></span>
          <div
            class="relative rounded-full bg-base-100 text-base-content/50 flex sm:flex-none w-24 sm:w-64 md:w-80"
            (click)="searchOverlay.openSearch()"
          >
            <svg
              lucideSearch
              class="w-6 h-6 absolute left-2 top-1/2 transform -translate-y-1/2"
            ></svg>
            <input
              type="text"
              placeholder="Search tasks..."
              class="w-full sm:w-64 md:w-80 pl-8 pr-4 py-2 rounded-full placeholder:text-base-content/50 placeholder:italic border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary focus:border-primary transition-colors bg-transparent text-base-content"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <ui-button
          variant="icon"
          size="icon"
          aria-label="Toggle Theme"
            (click)="themeService.toggleTheme()"
            title="Toggle Theme"
          >
            @if (themeService.currentTheme() === 'light') {
              <svg lucideMoon></svg>
            } @else {
              <svg lucideSun></svg>
            }
          </ui-button>

          <ui-button
            variant="icon"
            size="icon"
            aria-label="Notifications"
            title="Notifications"
          >
            <svg lucideBell></svg>
          </ui-button>
          <div class="relative group">
            <ui-dropdown-menu>
            <ui-dropdown-menu-trigger>
            <ui-button
              variant="icon"
              size="icon"
              aria-label="User menu"
              class="border border-base-300 cursor-pointer rounded-full"
              >
              <app-avatar
                [name]="authStore.currentUser()?.name ?? ''"
                [title]="authStore.currentUser()?.name ?? ''"
              ></app-avatar>
            </ui-button>
        </ui-dropdown-menu-trigger>
        <ui-dropdown-menu-content>
          <div class="p-1">
           
            <ui-dropdown-menu-item>Profile</ui-dropdown-menu-item>
            <ui-dropdown-menu-item>Settings</ui-dropdown-menu-item>
            <ui-dropdown-menu-item (onClick)="logout()">Logout</ui-dropdown-menu-item>
          </div>
        </ui-dropdown-menu-content>
      </ui-dropdown-menu>
          </div>
        </div>
      </div>
    </header>
    <app-search-overlay #searchOverlay></app-search-overlay>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  public themeService = inject(ThemeService);
  authStore = inject(AuthStoreService);
  @Output() menuToggle = new EventEmitter<void>();
  logout() {
    this.authStore.logout();
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

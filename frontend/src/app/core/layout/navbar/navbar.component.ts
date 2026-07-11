import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  ViewChild,
  input,
  output
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { ThemeService } from '../../services/theme.service';
import { SearchOverlayComponent } from '../../../shared/components/search/search-overlay.component';
import { CreateWorkspaceModalComponent } from '../../../features/workspace/components/create-workspace-modal.component';
import { APP_ICONS } from '../../icons/lucide-icons';
import {
  UiDropdownMenuComponent,
  UiDropdownMenuContent,
  UiDropdownMenuTrigger,
} from '../../../ui/components/ui-dropdown-menu.component';
import { UiDropdownMenuItemComponent } from '../../../ui/components/ui-dropdown-menu-item.component';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { UiAvatarComponent } from '../../../ui/components/ui-avatar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    SearchOverlayComponent,
    CreateWorkspaceModalComponent,
    UiAvatarComponent,
    UiButtonComponent,
    UiDropdownMenuComponent,
    UiDropdownMenuTrigger,
    UiDropdownMenuContent,
    UiDropdownMenuItemComponent,
    ...APP_ICONS,
  ],
  template: `
    <header class="sticky top-0 z-10  bg-base-200/70 p-2 backdrop-blur-lg border-b border-base-300">
      <div class="flex items-center justify-between w-full gap-4">
        <div class="flex items-center gap-1 sm:gap-3 flex-shrink-0 md:hidden">
          <ui-button variant="ghost" size="icon" aria-label="Toggle Menu" (click)="menuToggle.emit()" class="text-base-content/70 hover:text-base-content hover:bg-base-200/50 rounded-full transition-colors">
          <svg lucideMenu class="w-5 h-5"></svg>
          </ui-button>
          
          <span class="font-bold text-lg tracking-tight hidden sm:block md:hidden lg:block">TaskFlow</span>
        </div>
        <div class="flex-1 flex justify-start">
        </div>
       @if (!isMobile()) {
        <div class="flex-none" (click)="searchOverlay.openSearch()">
          <div class="relative rounded-full bg-base-100 text-base-content/50 flex sm:w-64 md:w-80 lg:w-96 cursor-pointer">
            <svg
              lucideSearch
              class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
            ></svg>
            <input
              type="text"
              placeholder="Search tasks (Ctrl+K)..."
              readonly
              class="w-full pl-9 pr-4 py-1.5 rounded-full placeholder:text-base-content/50 placeholder:italic border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary focus:border-primary transition-colors bg-transparent text-base-content cursor-pointer text-sm"
            />
          </div>
        </div>
} @else {
        <div class="flex-none">
          <ui-button
            variant="icon"
            size="icon"
            aria-label="Search"
            (click)="searchOverlay.openSearch()"
            title="Search"
          >
            <svg lucideSearch class="w-5 h-5"></svg>
          </ui-button>
        </div>
}

        <div class="flex-1 flex items-center justify-end gap-2">
          <ui-button
            variant="icon"
            size="icon"
            aria-label="Toggle Theme"
            (click)="themeService.toggleTheme()"
            title="Toggle Theme"
          >
            @if (themeService.currentTheme() === 'light') {
              <svg lucideMoon class="w-5 h-5"></svg>
            } @else {
              <svg lucideSun class="w-5 h-5"></svg>
            }
          </ui-button>

          <ui-button variant="icon" size="icon" aria-label="Notifications" title="Notifications">
            <svg lucideBell class="w-5 h-5"></svg>
          </ui-button>

          <div class="relative group ml-1">
            <ui-dropdown-menu>
              <ui-dropdown-menu-trigger>
                <ui-button
                  variant="ghost"
                  size="icon"
                  aria-label="User menu"
                >
                  <ui-avatar
                    [name]="authStore.currentUser()?.name || 'User'"
                    [title]="authStore.currentUser()?.name || 'User'"
                    [src]="authStore.currentUser()?.avatarUrl || ''"
                    size="lg"
                  ></ui-avatar>
                </ui-button>
              </ui-dropdown-menu-trigger>
              <ui-dropdown-menu-content>
                <div class="p-1">
                  <ui-dropdown-menu-item routerLink="/profile">Profile</ui-dropdown-menu-item>
                  <ui-dropdown-menu-item routerLink="/activity">Activity</ui-dropdown-menu-item>
                  <ui-dropdown-menu-item (onClick)="createWsModal.open()">Create Workspace</ui-dropdown-menu-item>
                  <ui-dropdown-menu-item routerLink="/settings">Settings</ui-dropdown-menu-item>
                  <div class="h-px bg-base-300 my-1"></div>
                  <ui-dropdown-menu-item (onClick)="logout()" class="text-error focus:text-error">Logout</ui-dropdown-menu-item>
                </div>
              </ui-dropdown-menu-content>
            </ui-dropdown-menu>
          </div>
        </div>
        
      </div>
    </header>
    <app-search-overlay #searchOverlay></app-search-overlay>
    <app-create-workspace-modal #createWsModal></app-create-workspace-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  public themeService = inject(ThemeService);
  authStore = inject(AuthStoreService);
  isMobile = input(false);
  menuToggle = output<void>();
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
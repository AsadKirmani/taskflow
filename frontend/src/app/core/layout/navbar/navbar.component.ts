import { ChangeDetectionStrategy, Component, EventEmitter, Output , HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';
import { UserMenuComponent } from './usermenu.component';

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
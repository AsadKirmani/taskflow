import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <header class="sticky top-0 z-10 mt-3 mx-2 sm:mt-4 sm:mx-4 rounded-2xl bg-gray-50 p-3 sm:p-4 text-white">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex w-full items-center gap-2 sm:w-auto">
      <button type="button" aria-label="Toggle sidebar" (click)="menuToggle.emit()" class="flex items-center justify-center text-gray-800 hover:bg-gray-200 rounded p-1 shrink-0">
        <mat-icon style="">dock_to_right</mat-icon>
      </button>
      <span class="hidden text-gray-200 sm:inline"> | </span>
      <div class="relative rounded-full bg-white text-gray-200 flex-1 sm:flex-none">
        <mat-icon class="absolute left-2 top-1/2 transform -translate-y-1/2">search</mat-icon>
        <input type="text" placeholder="Search tasks..." class="w-full sm:w-64 md:w-80 pl-8 pr-4 py-2 rounded-full placeholder:text-gray-500 placeholder:italic border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    </div>
    
    <div class="flex items-center justify-end gap-2">
    <button type="button" aria-label="Notifications" class="flex items-center justify-center bg-white text-gray-600 w-10 h-10 rounded-full hover:bg-gray-200">
        <mat-icon>notifications</mat-icon>
        </button>
      <div class="relative group">
        <button type="button" aria-label="User profile" class="flex items-center justify-center bg-white text-gray-600 w-10 h-10 rounded-full hover:bg-gray-200">
          <mat-icon>account_circle</mat-icon>
        </button>
        <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
          <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</a>
          <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Settings</a>
          <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100" (click)="logout()">Logout</a>
        </div>
      </div>
    </div>
    </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  constructor(private authStore: AuthStoreService) {}
  logout() {
    // Implement logout logic here
    this.authStore.logout();
    console.log('User logged out');
  }
}
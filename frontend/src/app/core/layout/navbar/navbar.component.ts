import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthStoreService } from '../../../features/auth/data-access/auth-store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <header class="flex items-center justify-between p-4 bg-gray-50 text-white sticky top-0 mt-4 mx-4 z-10 rounded-2xl">
    <div class="flex items-center gap-2">
      <button type="button" aria-label="Toggle sidebar" (click)="menuToggle.emit()" class="flex items-center justify-center text-gray-800 hover:bg-gray-200 rounded p-1">
        <mat-icon style="">dock_to_right</mat-icon>
      </button>
      <span class="text-gray-200"> | </span>
      <div class="relative bg-white rounded-full text-gray-200">
        <mat-icon class="absolute left-2 top-1/2 transform -translate-y-1/2">search</mat-icon>
        <input type="text" placeholder="Search tasks..." class="pl-8 pr-4 py-2 rounded-full placeholder:text-gray-500 placeholder:italic border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    </div>
    
    <div class="flex items-center gap-2">
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
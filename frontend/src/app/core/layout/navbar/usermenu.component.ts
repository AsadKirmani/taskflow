import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-user-menu',
    template: `
    <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
      <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</a>
        <a href="/settings" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Settings</a>
                <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100" (click)="onLogout($event)">Logout</a>
    </div>
    `
})
export class UserMenuComponent {
    @Output() logout = new EventEmitter<void>();

    onLogout(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.logout.emit();
    }
}
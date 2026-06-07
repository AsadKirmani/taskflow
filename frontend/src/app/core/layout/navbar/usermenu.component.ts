import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-user-menu',
    template: `
    <div class="absolute right-0 mt-2 w-48 bg-base-300 rounded-box shadow-md z-20 p-2 shadow-primary">
      <a href="#" class="block px-4 py-2 text-base-content hover:bg-base-100 rounded-field">Profile</a>
        <a href="/settings" class="block px-4 py-2 text-base-content hover:bg-base-100 rounded-field">Settings</a>
                <a href="#" class="block px-4 py-2 text-base-content hover:bg-base-100 rounded-field" (click)="onLogout($event)">Logout</a>
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
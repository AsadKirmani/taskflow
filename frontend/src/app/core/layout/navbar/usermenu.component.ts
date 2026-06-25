import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-user-menu',
    imports: [RouterLink],
    template: `
    <div class="absolute right-0 mt-2 w-48 bg-base-100 rounded-box z-20 p-2 border border-base-content/20 shadow-lg">
      <a routerLink="/profile" class="block px-4 py-2 text-base-content hover:bg-base-200 rounded-field">Profile</a>
      <a routerLink="/settings" class="block px-4 py-2 text-base-content hover:bg-base-200 rounded-field">Settings</a>
      <a routerLink="/logout" class="block px-4 py-2 text-base-content hover:bg-base-200 rounded-field" (click)="onLogout($event)">Logout</a>
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
import { MatIconModule } from "@angular/material/icon";
import { Component, input, output } from "@angular/core";
import { User } from "../../../core/models/user.model";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "../../../shared/components/avatar.component";

@Component({
  selector: 'app-task-assignees',
  standalone: true,
  imports: [MatIconModule, CommonModule, AvatarComponent],
    template: `<div class="flex items-center gap-1">
    <div class="flex -space-x-3">
    @for (member of members(); track member.id) {
      <app-avatar [name]="member.name" [title]="member.name"></app-avatar>
}
      </div>
      @if (members().length > 0) {
          <button
            class="w-10 h-10 rounded-full border border-base-content flex items-center justify-center text-base-content hover:bg-base-content/10 transition-colors"
          >
            <mat-icon>add</mat-icon>
          </button>
}
        </div>`
})
export class TaskAssigneesComponent {
  members = input.required<User[]>();
  openPicker = output<void>();
 
}
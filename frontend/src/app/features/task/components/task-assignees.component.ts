import { MatIconModule } from "@angular/material/icon";
import { Component, input, output } from "@angular/core";
import { User } from "../../../core/models/user.model";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-task-assignees',
  standalone: true,
  imports: [MatIconModule, CommonModule],
    template: `<div class="flex -space-x-2">
            <div
              class="w-8 h-8 rounded-full border-2 border-white bg-blue-500 text-white flex items-center justify-center text-xs font-medium"
              [title]="member().name"
            >
              {{ member().name.substring(0, 1) }}
            </div>

          <button
            class="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center"
          >
            +
          </button>
        </div>`
})
export class TaskAssigneesComponent {
  member = input.required<User>();
  openPicker = output<void>();
 
}
import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../../core/models/user.model';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-action-members',
  standalone: true,
  imports: [CommonModule, MatIconModule, AutofocusDirective],
  template: `
    <div class="relative inline-flex w-full">
      <button
        (click)="isOpen.set(!isOpen())"
        [ngClass]="
          isOpen()
            ? 'bg-base-content text-base-100 hover:bg-base-content/90'
            : 'bg-base-100 text-base-content hover:bg-base-300'
        "
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-base-content/10 w-full"
      >
        <mat-icon class="text-[18px] w-[18px] h-[18px]">person_outline</mat-icon> Members
      </button>
      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="closePicker()"></div>
        <div
          class="absolute top-full right-0 mt-2 w-64 bg-base-100 border border-base-content/10 shadow-2xl rounded-lg z-50 p-3 animate-in fade-in zoom-in-95 duration-200"
        >
          <h4 class="text-xs font-bold text-base-content/70 mb-3 text-center">Members</h4>
          <div class="flex flex-col gap-1 relative z-50 max-h-60 overflow-y-auto">
            <input
              #searchInput
              type="text"
              appAutofocus
              placeholder="Search members..."
              class="focus:outline-none w-full px-3 py-1.5 mb-2 text-sm text-base-content rounded-field border border-base-content/10 focus:border-primary transition-colors"
              (keyup.enter)="onSearch(searchInput.value)"
            />
            @for (member of filteredMembers(); track member.id) {
              <div
                (click)="toggleMember(member.id)"
                class="flex items-center justify-between p-2 hover:bg-base-200 rounded cursor-pointer transition-colors group"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold"
                  >
                    {{ member?.name?.charAt(0)?.toUpperCase() || 'U' }}
                  </div>
                  <span
                    class="text-sm font-medium text-base-content group-hover:text-primary transition-colors"
                  >
                    {{ member.name }}
                    @if (member.id === currentUser()?.id) {
                      <span class="text-xs text-base-content/50 font-normal"> (You)</span>
                    }
                  </span>
                </div>

                @if (isAssigned(member.id)) {
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">check</mat-icon>
                }
              </div>
            }
            @if (filteredMembers().length === 0) {
              <div class="text-xs text-center text-base-content/50 py-2">No members found</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ActionMembersComponent {
  
  availableMembers = input<User[]>([]);
  assignedMemberIds = input<string[]>([]);
  currentUser = input<User | null>(null);

  memberToggled = output<string>();

  isOpen = signal(false);
  searchQuery = signal('');

  filteredMembers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const members = this.availableMembers() ?? [];
    if (!query) return members;

    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) || member.email?.toLowerCase().includes(query),
    );
  });

  isAssigned(userId: string): boolean {
    return this.assignedMemberIds().includes(userId);
  }

  toggleMember(userId: string) {
    this.memberToggled.emit(userId);
  }

  onSearch(value: string) {
    this.searchQuery.set(value);
  }

  closePicker() {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }
}
import { Component, input, output, signal, computed, effect } from '@angular/core';
import { User } from '../../../../core/models/user.model';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';

@Component({
  selector: 'app-action-members',
  standalone: true,
  imports: [AutofocusDirective, UiButtonComponent, ...APP_ICONS],
  template: `
    <div class="relative inline-flex w-full">
      <ui-button
        (click)="isOpen.set(!isOpen())"
        variant="outline"
        [active]="isOpen()"
      >
        <svg lucideUser class="w-4 h-4 mr-2"></svg> Members
      </ui-button>
      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="closePicker()"></div>
        <div
          class="absolute top-full right-0 mt-2 w-64 bg-base-100 border border-base-300 shadow-2xl rounded-lg z-50 p-3 animate-in fade-in zoom-in-95 duration-200"
        >
          <h4 class="text-xs font-bold text-base-content/70 mb-3 text-center">Members</h4>
          <div class="flex flex-col gap-1 relative z-50 max-h-60 overflow-y-auto">
            <input
              #searchInput
              type="text"
              appAutofocus
              placeholder="Search members..."
              class="focus:outline-none w-full px-3 py-1.5 mb-2 text-sm text-base-content rounded-field border border-base-300 focus:border-primary transition-colors"
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
                    {{ member.name.charAt(0).toUpperCase() || 'U' }}
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
                  <svg lucideCheck class="w-4 h-4"></svg>
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

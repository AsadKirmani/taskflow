import { Component, inject, input, output, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { WorkspaceApiService } from '../../workspace/data-access/workspace-api.service';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiSelectComponent, SelectOption } from '../../../ui/components/ui-select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invite-member-modal',
  standalone: true,
  imports: [UiButtonComponent, UiSelectComponent, FormsModule, ...APP_ICONS],
  template: `
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      (mousedown)="onBackdropClick($event)"
    >
      <div class="bg-base-100 rounded-2xl shadow-xl p-6 w-full max-w-md border border-base-300">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-base-content">Invite to Workspace</h2>
            <p class="text-sm text-base-content/70">Collaborate with your team members.</p>
          </div>
          <ui-button
            (click)="closeModal()"
            variant="ghost"
            size="icon"
          >
            <svg lucideX></svg>
          </ui-button>
        </div>

        <form (submit)="sendInvite($event)">
          <div class="mb-4">
            <label class="block text-sm font-semibold text-base-content mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              placeholder="colleague@company.com"
              class="w-full px-4 py-2.5 bg-base-100 border border-base-300 text-base-content focus:border-primary rounded-field focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div class="mb-6">
            <ui-select
              name="role"
              [label]="'Role'"
              [placeholder]="'Select a role'"
              [options]="roleOptions"
              [(ngModel)]="selectedRole"
              class="w-full text-base-content"
            ></ui-select>
          </div>

          <div class="flex gap-3 pt-2">
            <ui-button
              (click)="closeModal()"
              variant="ghost"
              size="lg"
              [fullWidth]="true"
            >
              Cancel
            </ui-button>
            
            <ui-button
              type="submit"
              variant="primary"
              size="lg"
              [fullWidth]="true"
              [disabled]="isSubmitting() || !email || !selectedRole"
              [loading]="isSubmitting()"
              [loadingText]="'Sending...'"
            >
              Send Invite
            </ui-button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class InviteMemberModalComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly workspaceApi = inject(WorkspaceApiService);

  readonly workspaceId = input.required<string>();
  readonly close = output<void>();

  isSubmitting = signal(false);
  email = '';
  selectedRole = 'MEMBER';

  readonly roleOptions: SelectOption[] = [
    { label: 'Member (Can edit boards)', value: 'MEMBER' },
    { label: 'Guest (Read-only)', value: 'GUEST' }
  ];

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  sendInvite(event: Event): void {
    event.preventDefault();

    const trimmedEmail = this.email.trim();

    if (!trimmedEmail) {
      this.notificationService.error('Please enter a valid email address');
      return;
    }

    if (!this.selectedRole) {
      this.notificationService.error('Please select a role');
      return;
    }

    this.isSubmitting.set(true);

    this.workspaceApi.inviteWorkspaceMember(this.workspaceId(), trimmedEmail, this.selectedRole).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success(`Invite sent to ${trimmedEmail} as ${this.selectedRole}`);
        this.closeModal();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg = err?.error?.message || 'Failed to send invite. Please try again.';
        this.notificationService.error(errorMsg);
      },
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
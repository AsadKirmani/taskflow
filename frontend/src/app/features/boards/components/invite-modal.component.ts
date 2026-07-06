import { Component, inject, input, output, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { WorkspaceApiService } from '../../workspace/data-access/workspace-api.service';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';
import { APP_ICONS } from '../../../core/icons/lucide-icons';
import { UiSelectComponent } from '../../../ui/components/ui-select.component';

@Component({
  selector: 'app-invite-member-modal',
  standalone: true,
  imports: [UiButtonComponent, UiSelectComponent, ...APP_ICONS],
  template: `
    <div
      class="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 p-4"
      (click)="closeModal()"
    >
      <div
        class="bg-base-100 rounded-2xl shadow-xl p-6 w-full max-w-md border border-base-300"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-base-content">Invite to Workspace</h2>
            <p class="text-sm text-base-content/70">Collaborate with your team members.</p>
          </div>
          <ui-button
            (click)="closeModal()"
            variant="ghost"
            size="icon-sm"
          >
            <svg lucideX class="w-5 h-5"></svg>
          </ui-button>
        </div>

        <form (submit)="sendInvite($event)">
          <div class="mb-4">
            <label class="block text-sm font-semibold text-base-content mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="colleague@company.com"
              class="w-full px-4 py-2.5 border border-base-300 text-base-content focus:border-accent rounded-field focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>

          <div class="mb-6">
          <ui-select
              label="Role"
              name="role"
              placeholder="Select a role"
              class="text-base-content w-full"
            >
              <option value="MEMBER">Member (Can edit boards)</option>
              <option value="GUEST">Guest (Read-only)</option>
            </ui-select>
          </div>
            

          <div class="flex gap-3 pt-2">
            <ui-button
              (click)="closeModal()"
              variant="ghost"
              size="lg"
            >
              Cancel
            </ui-button>
            <ui-button
              type="submit"
              variant="primary"
              [disabled]="isSubmitting()"
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

  sendInvite(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const email = ((formData.get('email') as string) || '').trim();
    const role = formData.get('role') as string;

    if (!email) {
      this.notificationService.error('Please enter a valid email address');
      return;
    }

    this.isSubmitting.set(true);

    this.workspaceApi.inviteWorkspaceMember(this.workspaceId(), email, role).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success(`Invite sent to ${email} as ${role}`);
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

import { Component, inject, input, output, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { WorkspaceApiService } from '../../workspace/data-access/workspace-api.service';

@Component({
  selector: 'app-invite-member-modal',
  standalone: true,
  imports: [], 
  template: `
    <div class="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
      <div class="bg-base-100 rounded-2xl shadow-xl p-6 w-full max-w-md border border-base-content/30" (click)="$event.stopPropagation()">
        
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-base-content">Invite to Workspace</h2>
            <p class="text-sm text-base-content/70">Collaborate with your team members.</p>
          </div>
          <button (click)="closeModal()" class="text-base-content/70 hover:text-base-content transition-colors p-2 rounded-full hover:bg-base-content/10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form (submit)="sendInvite($event)">
          
          <div class="mb-4">
            <label class="block text-sm font-semibold text-base-content mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required
              placeholder="colleague@company.com" 
              class="w-full px-4 py-2.5 border border-base-content/30 text-base-content focus:border-accent rounded-field focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            >
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-base-content mb-2">Role</label>
            <select 
              name="role" 
              class="w-full px-4 py-2.5 border border-base-content/30 text-base-content rounded-field focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-base-100"
            >
              <option value="MEMBER">Member (Can edit boards)</option>
              <option value="GUEST">Guest (Read-only)</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              type="button" 
              (click)="closeModal()" 
              class="flex-1 border border-base-content/30 text-base-content font-semibold rounded-box hover:bg-base-content/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              [disabled]="isSubmitting()"
              class="flex-1 p-2 bg-primary text-white font-semibold rounded-box hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              } @else {
                Send Invite
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  `
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
    
    const email = (formData.get('email') as string || '').trim();
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
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
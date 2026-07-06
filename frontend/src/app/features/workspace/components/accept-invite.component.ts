import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceApiService } from '../data-access/workspace-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UiButtonComponent } from '../../../ui/components/ui-button.component';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [UiButtonComponent],
  template: `
    <div class="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 max-w-md w-full text-center"
      >
        @if (status() === 'loading') {
          <div class="flex justify-center mb-6">
            <svg class="animate-spin h-10 w-10 text-stone-900" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-stone-900 mb-2">Verifying Invitation...</h2>
          <p class="text-stone-500 text-sm">Please wait while we set up your workspace access.</p>

        } @else if (status() === 'error') {
          <div class="flex justify-center mb-6">
            <div
              class="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 class="text-xl font-bold text-stone-900 mb-2">Invalid or Expired Link</h2>
          <p class="text-stone-500 text-sm mb-6">{{ errorMessage() }}</p>
          <ui-button
            variant="primary"
            (click)="goToHome()"
            class="w-full bg-stone-900 text-white font-semibold py-2.5 rounded-xl hover:bg-black transition-colors"
          >
            Go to Dashboard
          </ui-button>
        }
      </div>
    </div>
  `,
})
export class AcceptInviteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workspaceApi = inject(WorkspaceApiService);
  private readonly notificationService = inject(NotificationService);

  status = signal<'loading' | 'error'>('loading');
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      this.errorMessage.set('No invitation token found in the URL.');
      return;
    }

    this.workspaceApi.acceptWorkspaceInvite(token).subscribe({
      next: (response) => {
        this.notificationService.success('Welcome to the workspace!');
        this.router.navigate(['/w', response.workspaceId, 'boards']);
      },
      error: (err) => {
        this.status.set('error');
        this.errorMessage.set(
          err.error?.error || 'Failed to accept the invitation. It might have expired.',
        );
        this.notificationService.error('Failed to join workspace');
      },
    });
  }

  goToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStoreService } from '../../data-access/auth-store.service';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AutofocusDirective,UiButtonComponent, ...APP_ICONS],
  template: `
    <section class="flex items-center justify-center mx-auto h-screen bg-base-200 px-4">
      <div class="p-8 bg-base-100 rounded-box shadow-xl border border-base-300 w-full max-w-md">
        <h1 class="text-2xl font-extrabold text-base-content mb-6">Create account</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="mb-5">
            <label for="name" class="block mb-1.5 text-sm font-semibold text-base-content/90"
              >Name</label
            >
            <input
              id="name"
              type="text"
              appAutofocus
              formControlName="name"
              class="w-full p-2 border border-base-300 rounded-field bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50 transition-all"
              placeholder="John Doe"
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <span class="text-error text-xs mt-1">Name must be at least 2 characters</span>
            }
          </div>

          <div class="mb-5">
            <label for="email" class="block mb-1.5 text-sm font-semibold text-base-content/90"
              >Email</label
            >
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full p-2 border border-base-300 rounded-field bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50 transition-all"
              placeholder="name@email.com"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="text-error text-xs mt-1">Please enter a valid email</span>
            }
          </div>

          <div class="mb-6 relative">
            <label for="password" class="block mb-1.5 text-sm font-semibold text-base-content/90"
              >Password</label
            >
            <input
              id="password"
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              class="w-full p-2 border border-base-300 rounded-field bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50 transition-all"
              placeholder="••••••••"
            />
            <ui-button
              type="button"
              (click)="togglePasswordVisibility()"
              variant="ghost"
              size="icon-sm"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 py-2 text-base-content/70 hover:text-base-content transition-colors"
            >
              @if (hidePassword()) {
                <svg lucideEyeClosed class="w-5 h-5" stroke-width="1.5"></svg>
              } @else {
                <svg lucideEye class="w-5 h-5" stroke-width="1.5"></svg>
              }
            </ui-button>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="text-error text-xs mt-1">Password must be at least 8 characters</span>
            }
          </div>
          <label for="remember" class="flex items-center mb-6 cursor-pointer">
            <input
              id="remember"
              type="checkbox"
              value=""
              class="w-4 h-4 rounded-sm border border-base-300 bg-base-100 checked:bg-primary"
            />
            <p class="ms-2 text-sm font-medium text-base-content select-none">
              I agree with the
              <a
                routerLink="/terms"
                class="text-primary hover:text-primary/80 hover:underline transition-colors"
                >terms and conditions</a
              >.
            </p>
          </label>

          <ui-button
            variant="primary"
            size="lg"
            type="submit"
          >
            Register
          </ui-button>
        </form>

        <p class="mt-6 text-sm text-center text-base-content/70">
          Already have an account?
          <a
            routerLink="/auth/login"
            class="text-primary font-semibold hover:underline transition-colors"
            >Login</a
          >
        </p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStoreService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  hidePassword = signal(true);
  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStoreService } from '../../data-access/auth-store.service';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AutofocusDirective],
  template: `
    <section class="flex items-center justify-center mx-auto h-screen bg-base-200 px-4">
  <div class="p-8 bg-base-100 rounded-box shadow-xl border border-base-300 w-full max-w-md">
    <h1 class="text-2xl font-extrabold text-base-content mb-6">Create account</h1>

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="mb-5">
        <label for="name" class="block mb-1.5 text-sm font-semibold text-base-content/90">Name</label>
        <input
          id="name"
          type="text"
          appAutofocus
          formControlName="name"
          class="w-full p-2 border border-base-content/30 rounded-field bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50 transition-all"
          placeholder="John Doe"
        />
      </div>

      <div class="mb-5">
        <label for="email" class="block mb-1.5 text-sm font-semibold text-base-content/90">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          class="w-full p-2 border border-base-content/30 rounded-field bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50 transition-all"
          placeholder="name@email.com"
        />
      </div>

      <div class="mb-6">
        <label for="password" class="block mb-1.5 text-sm font-semibold text-base-content/90">Password</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          class="w-full p-2 border border-base-content/30 rounded-field bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50 transition-all"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        class="w-full p-field rounded-box bg-primary text-primary-content font-bold cursor-pointer transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 border-none"
      >
        Register
      </button>
    </form>

    <p class="mt-6 text-sm text-center text-base-content/70">
      Already have an account?
      <a routerLink="/auth/login" class="text-primary font-semibold hover:underline transition-colors">Login</a>
    </p>
  </div>
</section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStoreService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard'])
    });
  }
}
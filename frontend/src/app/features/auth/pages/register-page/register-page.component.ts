import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStoreService } from '../../data-access/auth-store.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <h1>Create account</h1>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label for="name">Name</label>
          <input id="name" type="text" formControlName="name" />
        </div>

        <div>
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" />
        </div>

        <div>
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" />
        </div>

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account?
        <a routerLink="/auth/login">Login</a>
      </p>
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
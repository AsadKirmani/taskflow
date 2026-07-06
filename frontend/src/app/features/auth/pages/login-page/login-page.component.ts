import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStoreService } from '../../data-access/auth-store.service';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { User } from '../../../../core/models/user.model';
import { APP_ICONS } from '../../../../core/icons/lucide-icons';
import { UiButtonComponent } from '../../../../ui/components/ui-button.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AutofocusDirective, UiButtonComponent, ...APP_ICONS],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStoreService);
  private readonly router = inject(Router);

  readonly savedUser = signal<User | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false]
  });
  hidePassword = signal(true);
  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  ngOnInit(): void {
    const userStr = localStorage.getItem('rememberedUser');
    if (userStr) {
      try {
        const user: User = JSON.parse(userStr);
        this.savedUser.set(user);
        this.form.patchValue({ email: user.email, remember: true });
      } catch (e) {
        localStorage.removeItem('rememberedUser');
      }
    }
  }

  useAnotherAccount(): void {
    this.savedUser.set(null);
    this.form.patchValue({ email: '', password: '', remember: false });
    localStorage.removeItem('rememberedUser');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, remember } = this.form.getRawValue();

    this.authStore.login({ email, password }).subscribe({
      next: () => {
        if (remember) {
          const user: User | null = this.authStore.currentUser(); 
          if (user) {
            const profileToSave = { name: user.name, email: user.email, avatarUrl: user.avatarUrl };
            localStorage.setItem('rememberedUser', JSON.stringify(profileToSave));
          }
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
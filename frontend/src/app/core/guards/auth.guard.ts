import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

  // 1. If the store isn't initialized yet, we can't make a decision safely.
  // (This handles the brief moment when the app first boots up and checks the session)
  if (!authStore.isInitialized()) {
    return false; 
  }

  // 2. Clear, synchronous check directly from the computed Signal
  if (authStore.isAuthenticated()) {
    return true;
  }

  // 3. Fallback: Securely redirect unauthenticated users to the login screen
  return router.createUrlTree(['/auth/login']);
};

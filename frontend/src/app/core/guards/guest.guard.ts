import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

const mightBeLoggedIn = localStorage.getItem('is_logged_in') === 'true';
if (!mightBeLoggedIn) {
  return true;
}

  if (authStore.isInitialized()) {
    if (authStore.isAuthenticated()) {
      return router.createUrlTree(['/dashboard']);
    }
    return true;
  }

  return toObservable(authStore.isInitialized).pipe(
    filter((isInit) => isInit === true),
    take(1),
    map(() => {
      if (authStore.isAuthenticated()) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    }),
  );
};

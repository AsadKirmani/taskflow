import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

  return authStore.state$.pipe(
    filter(state => state.initialized),
    take(1),
    map(state => {
      if (state.isAuthenticated) {
        return router.createUrlTree(['/dashboard']);
      }

      return true;
    })
  );
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

  return toObservable(authStore.isInitialized).pipe(
    filter((isInit) => isInit === true),
    map(() => {
      if (authStore.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree(['/']);
    }),
  );
};

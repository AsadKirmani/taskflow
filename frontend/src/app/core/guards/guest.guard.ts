import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

  // SCENARIO 1: Agar state already load ho chuki hai (Normal link click)
  if (authStore.isInitialized()) {
    if (authStore.isAuthenticated()) {
      return router.createUrlTree(['/dashboard']);
    }
    return true;
  }

  // SCENARIO 2: Agar user ne page refresh kiya hai (Wait for state)
  // toObservable use karke hum signal ko rxjs stream bana rahe hain
  return toObservable(authStore.isInitialized).pipe(
    filter((isInit) => isInit === true), // ⏳ Yahan code tab tak rukega jab tak API check complete na ho
    take(1), // Angular guards ke liye observable ko close karna zaroori hai
    map(() => {
      if (authStore.isAuthenticated()) {
        return router.createUrlTree(['/dashboard']);
      }
      return true; // Token fail hua, landing page dikhao
    })
  );
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

  // Signal ko Observable mein convert karo taaki hum API ka wait kar sakein
  return toObservable(authStore.isInitialized).pipe(
    // Jab tak initialized TRUE na ho jaye, aage mat badho
    filter((isInit) => isInit === true), 
    map(() => {
      // Ek baar initialize ho gaya, tab check karo ki logged in hai ya nahi
      if (authStore.isAuthenticated()) {
        return true; // Aage jaane do
      }
      return router.createUrlTree(['/auth/login']); // Login pe bhejo
    })
  );
};
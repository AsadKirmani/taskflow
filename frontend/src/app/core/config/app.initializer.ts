import { inject } from '@angular/core';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';

export function initializeApp(): Promise<unknown> {
  const authStore = inject(AuthStoreService);

  return () => authStore.initializeSession();
}

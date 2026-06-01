import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';

export function initializeApp(): Promise<unknown> {
  const authStore = inject(AuthStoreService);

  return firstValueFrom(authStore.initializeSession());
}
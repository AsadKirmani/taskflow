import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthStoreService } from '../../features/auth/data-access/auth-store.service';

export function initializeApp(): () => Promise<any> {
  const authStore = inject(AuthStoreService);
  const injector = inject(EnvironmentInjector); 

  return () => {
    return runInInjectionContext(injector, () => 
      firstValueFrom(authStore.initializeSession())
    );
  };
}
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideLucideIcons } from '@lucide/angular';
import { APP_ICONS } from './core/icons/lucide-icons';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { AuthStoreService } from './features/auth/data-access/auth-store.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([loadingInterceptor, errorInterceptor, authInterceptor])),

    provideLucideIcons(...APP_ICONS),
  ],
};

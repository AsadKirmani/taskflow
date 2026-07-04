import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { SettingsApiService } from './settings-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthStoreService } from '../../auth/data-access/auth-store.service';

type SettingsState = {
  user: { name: string; email: string; avatarUrl: string } | null;
  isLoading: boolean;
  isSaving: boolean;
  isLoaded: boolean;
};

const initialState: SettingsState = {
  user: null,
  isLoading: true,
  isSaving: false,
  isLoaded: false,
};

export const SettingsStoreService = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ isLoading, isSaving, isLoaded, user }) => ({
    loading: computed(() => isLoading()),
    saving: computed(() => isSaving()),
    loaded: computed(() => isLoaded()),
    profileData: computed(() => user()),
  })),
  withMethods(
    (
      store,
      api = inject(SettingsApiService),
      notification = inject(NotificationService),
      authStore = inject(AuthStoreService),
    ) => ({
      async loadProfile(forceRefresh = false) {
        if (!forceRefresh && store.loaded()) return;
        patchState(store, { isLoading: true });
        try {
          const res = await firstValueFrom(api.getProfile());
          patchState(store, { user: res.data.user, isLoading: false, isLoaded: true });
        } catch (err) {
          notification.error('Failed to load settings');
          patchState(store, { isLoading: false, isLoaded: false });
        }
      },

      async updateProfile(data: { name: string; email: string; avatarUrl: string }) {
        patchState(store, { isSaving: true });
        try {
          await firstValueFrom(api.updateProfile(data));
          patchState(store, { user: data, isSaving: false });
          notification.success('Profile updated successfully!');
        } catch (err) {
          notification.error('Failed to update profile');
          patchState(store, { isSaving: false });
        }
      },

      async updatePassword(data: any) {
        patchState(store, { isSaving: true });
        try {
          await firstValueFrom(api.updatePassword(data));
          patchState(store, { isSaving: false });
          notification.success('Password changed successfully!');
          return true;
        } catch (err) {
          notification.error('Failed to change password. Check your current password.');
          patchState(store, { isSaving: false });
          return false;
        }
      },
      async uploadAvatar(file: File) {
        patchState(store, { isSaving: true });
        try {
          const res = await firstValueFrom(api.uploadAvatar(file));
          const updatedUser = res.data.user;
          const currentUser = store.user();
          if (currentUser) {
            patchState(store, {
              user: { ...currentUser, avatarUrl: updatedUser.avatarUrl },
              isSaving: false,
            });
          }
          authStore.updateUserProfile({ avatarUrl: updatedUser.avatarUrl });
          notification.success('Avatar uploaded successfully!');
          return updatedUser.avatarUrl;
        } catch (err) {
          notification.error('Failed to upload avatar.');
          patchState(store, { isSaving: false });
          return null;
        }
      },
    }),
  ),
);

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/auth/me`);
  }

  updateProfile(data: { name: string; email: string }) {
    return this.http.patch(`${this.apiUrl}/auth/update-profile`, data);
  }

  updatePassword(data: any) {
    return this.http.patch(`${this.apiUrl}/auth/reset-password`, data);
  }
}
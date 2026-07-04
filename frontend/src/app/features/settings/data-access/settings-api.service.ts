import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';

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
  uploadAvatar(file: File): Observable<{ data: { user: { avatarUrl: string } } }> {
      const formData = new FormData();
      formData.append('avatar', file); // 'avatar' key backend expect karega
      // Backend pe POST request bhejo
      return this.http.post<{ data: { user: { avatarUrl: string } } }>(
        `${this.apiUrl}/auth/upload-avatar`,
        formData
      );  
    }
}
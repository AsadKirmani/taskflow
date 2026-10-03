import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UserProfile } from '../../../core/models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);

  getProfile(userId: string): Observable<ApiResponse<{ user: UserProfile }>> {
  return this.http.get<ApiResponse<{ user: UserProfile }>>(
    `${this.baseUrl}/profile/${userId}`,
    { withCredentials: true }
  );
}
}
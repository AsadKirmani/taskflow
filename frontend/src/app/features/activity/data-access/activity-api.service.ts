import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';
import { ActivityListData } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityApiService {
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  getGlobalActivity(page = 1, limit = 30): Observable<ApiResponse<ActivityListData>> {
    return this.http.get<ApiResponse<ActivityListData>>(
      `${this.baseUrl}`,
      {
        params: { page, limit },
        withCredentials: true
      }
    );
  }

  getWorkspaceActivity(workspaceId: string, page = 1, limit = 30): Observable<ApiResponse<ActivityListData>> {
    return this.http.get<ApiResponse<ActivityListData>>(
      `${this.baseUrl}/workspaces/${workspaceId}/activity`,
      {
        params: { page, limit },
        withCredentials: true
      }
    );
  }

  getBoardActivity(workspaceId: string, boardId: string, page = 1, limit = 30): Observable<ApiResponse<ActivityListData>> {
    return this.http.get<ApiResponse<ActivityListData>>(
      `${this.baseUrl}/workspaces/${workspaceId}/boards/${boardId}/activity`,
      {
        params: { page, limit },
        withCredentials: true
      }
    );
  }
}

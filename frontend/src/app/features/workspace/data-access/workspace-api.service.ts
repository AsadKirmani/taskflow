import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../core/models/api-response.model";
import { environment } from "../../../../environments/environment";
import { Workspace } from "../../../core/models/workspace.model";

@Injectable({ providedIn: 'root' })
export class WorkspaceApiService {
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);
  getMeContext(): Observable<ApiResponse<Workspace[]>> {
    return this.http.get<ApiResponse<Workspace[]>>(`${this.baseUrl}/auth/me`, {
      withCredentials: true
    });
  }
  getWorkspaces(): Observable<ApiResponse<Workspace[]>> {
    return this.http.get<ApiResponse<Workspace[]>>(`${this.baseUrl}/workspaces`, {
      withCredentials: true
    });
  }
  getWorkspaceMembers(workspaceId: string): Observable<ApiResponse<{ members: any[] }>> {
    return this.http.get<ApiResponse<{ members: any[] }>>(`${this.baseUrl}/workspaces/${workspaceId}/members`, {
      withCredentials: true
    });
  }
 
  inviteWorkspaceMember(workspaceId: string, email: string, role: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/workspaces/${workspaceId}/invites`,
      { email, role }
    );
  }

  acceptWorkspaceInvite(token: string) {
    return this.http.post<{ success: boolean; message: string; workspaceId: string }>(
      `${this.baseUrl}/workspaces/invites/accept`, 
      { token }
    );
  }
}
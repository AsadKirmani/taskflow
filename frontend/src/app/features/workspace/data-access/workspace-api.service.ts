import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../core/models/api-response.model";
import { environment } from "../../../../environments/environment";
import { Workspace } from "../../../core/models/workspace.model";

@Injectable({ providedIn: 'root' })
export class WorkspaceApiService {
  private readonly baseUrl = `${environment.apiUrl}/workspaces`;
  private readonly http = inject(HttpClient);

  getWorkspaces(): Observable<ApiResponse<Workspace[]>> {
    return this.http.get<ApiResponse<Workspace[]>>(this.baseUrl, {
      withCredentials: true
    });
  }
}
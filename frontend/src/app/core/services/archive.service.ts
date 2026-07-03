import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../..//environments/environment'; 

export interface ArchivePayload {
  workspaceId: string;
  entityType: 'board' | 'column' | 'task';
  entityId: string;
  entityName: string;
  reason?: string;
}

@Injectable({ providedIn: 'root' })
export class ArchiveService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; // Apne environment ke hisaab se set karna

  archive(payload: ArchivePayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/archive`, payload);
  }

  restore(payload: ArchivePayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/archive/restore`, payload);
  }

  getArchivedItems(workspaceId: string, entityType?: string): Observable<any> {
    let params = new HttpParams();
    if (entityType) {
      params = params.set('entityType', entityType);
    }
    return this.http.get(`${this.baseUrl}/workspaces/${workspaceId}/archive`, { params });
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  // Apna backend URL yahan daal
  private taskUrl = `${environment.apiUrl}/tasks`; 

  uploadAttachment(taskId: string, file: File): Observable<{ data: { filename: string; url: string, format?: string, uploadedAt?: string } }> {
    const formData = new FormData();
    formData.append('file', file); // 'file' key backend expect karega
  
    // Backend pe POST request bhejo
    return this.http.post<{ data: { filename: string; url: string, format?: string, uploadedAt?: string } }>(

      `${this.taskUrl}/${taskId}/attachments`,
      formData
    );
  }
}
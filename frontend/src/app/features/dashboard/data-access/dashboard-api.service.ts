import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';
import type { Task } from '../../../core/models/task.model';
import type { ActivityItem } from '../../../features/activity/models/activity.model';

export interface DashboardTaskRow {
  id: string;
  boardId: string;
  boardName: string;
  title: string;
  dueDate: string | null;
  priority: string;
  isCompleted: boolean;
}

export interface DashboardSummary {
  stats: {
    tasksDueToday: number;
    overdueTasks: number;
    completedTasks: number;
    newAssignmentsToday: number;
    activeBoards: number;
  };
  recentTasks: DashboardTaskRow[];
  recentActivities: ActivityItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  constructor(private http: HttpClient) {}
  private readonly baseUrl = `${environment.apiUrl}`;

  getDashboardSummary(workspaceId: string, userId: string): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(
      `${this.baseUrl}/dashboard/summary`,
      {
        params: { workspaceId, userId },
        withCredentials: true
      }
    );
  }
}
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Task } from '../../../core/models/task.model';
import { TaskComment } from '../../../core/models/comment.model';
import { environment } from '../../../../environments/environment';

export interface MoveTaskPayload {
  sourceColumnId: string;
  targetColumnId: string;
  sourceIndex: number;
  targetIndex: number;
  destinationColumnId?: string;
  position?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  assigneeIds?: string[];
  assignedAt?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: string;
}

export interface TaskQueryFilters {
  search?: string;
  priorities?: string[];
  assigneeIds?: string[];
  labels?: string[];
  activity?: string[];
  memberScope?: 'all' | 'no_members' | 'me';
  completion?: 'all' | 'completed' | 'incomplete';
  dueType?: 'all' | 'none' | 'overdue' | 'today' | 'this_week';
}

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  getTasksInBoard(
    boardId: string,
    filters?: TaskQueryFilters,
  ): Observable<ApiResponse<{ items: Task[] }>> {
    const params: Record<string, string> = {};

    if (filters?.search) params['search'] = filters.search;
    if (filters?.priorities?.length) params['priorities'] = filters.priorities.join(',');
    if (filters?.assigneeIds?.length) params['assigneeIds'] = filters.assigneeIds.join(',');
    if (filters?.labels?.length) params['labels'] = filters.labels.join(',');
    if (filters?.activity?.length) params['activity'] = filters.activity.join(',');
    if (filters?.memberScope && filters.memberScope !== 'all')
      params['memberScope'] = filters.memberScope;
    if (filters?.completion && filters.completion !== 'all')
      params['completion'] = filters.completion;
    if (filters?.dueType && filters.dueType !== 'all') params['dueType'] = filters.dueType;

    return this.http.get<ApiResponse<{ items: Task[] }>>(
      `${this.baseUrl}/boards/${boardId}/tasks`,
      { params, withCredentials: true },
    );
  }

  addTask(
    boardId: string,
    columnId: string,
    title: string,
    workspaceId: string,
    position?: number,
  ): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(
      `${this.baseUrl}/tasks`,
      { title, workspaceId, boardId, columnId, position },
      { withCredentials: true },
    );
  }

  updateTask(taskId: string, payload: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/tasks/${taskId}`, payload, {
      withCredentials: true,
    });
  }

  moveTask(taskId: string, payload: MoveTaskPayload): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/tasks/${taskId}/move`, payload, {
      withCredentials: true,
    });
  }

  getCommentsForTask(taskId: string): Observable<ApiResponse<{ comments: TaskComment[] }>> {
    return this.http.get<ApiResponse<{ comments: TaskComment[] }>>(
      `${this.baseUrl}/tasks/${taskId}/comments`,
      { withCredentials: true },
    );
  }

  postCommentToTask(
    taskId: string,
    content: string,
  ): Observable<ApiResponse<{ comment: TaskComment }>> {
    return this.http.post<ApiResponse<{ comment: TaskComment }>>(
      `${this.baseUrl}/tasks/${taskId}/comments`,
      { content },
      { withCredentials: true },
    );
  }

  deleteComment(commentId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/comments/${commentId}`, {
      withCredentials: true,
    });
  }
}

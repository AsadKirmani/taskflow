import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';
import { Task } from '../../../core/models/task.model';
import { environment } from '../../../../environments/environment';

export interface BoardDetailResponse {
  board: Board;
  columns: BoardColumn[];
  tasks: Task[];
}

export interface BoardListResponse {
  items: Board[];
}

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
export class BoardApiService {
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  createBoard(name: string, workspaceName: string, workspaceId: string, visibility: 'private' | 'workspace'): Observable<ApiResponse<Board>> {
    return this.http.post<ApiResponse<Board>>(
      `${this.baseUrl}/workspaces/${workspaceId}/boards`,
      { name, workspaceName, workspaceId, visibility },
      { withCredentials: true }
    );
  }

  getBoards(): Observable<ApiResponse<BoardListResponse>> {
    return this.http.get<ApiResponse<BoardListResponse>>(`${this.baseUrl}/boards`, {
      withCredentials: true
    });
  }

  getBoardById(boardId: string): Observable<ApiResponse<BoardDetailResponse>> {
    return this.http.get<ApiResponse<BoardDetailResponse>>(`${this.baseUrl}/boards/${boardId}`, {
      withCredentials: true
    });
  }

  moveTask(boardId: string, taskId: string, payload: MoveTaskPayload): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/boards/${boardId}/tasks/${taskId}/move`, payload, {
      withCredentials: true
    });
  }
  getBoardColumns(boardId: string): Observable<ApiResponse<{ columns: BoardColumn[] }>> {
    return this.http.get<ApiResponse<{ columns: BoardColumn[] }>>(`${this.baseUrl}/boards/${boardId}/columns`, {
      withCredentials: true
    });
  }

  createColumn(boardId: string, workspaceId: string, name: string): Observable<ApiResponse<BoardColumn>> {
    return this.http.post<ApiResponse<BoardColumn>>(
      `${this.baseUrl}/workspaces/${workspaceId}/boards/${boardId}/columns`,
      { name },
      { withCredentials: true }
    );
  }

  getTasksInBoard(boardId: string, filters?: TaskQueryFilters): Observable<ApiResponse<{ items: Task[] }>> {
    const params: Record<string, string> = {};

    if (filters?.search) params['search'] = filters.search;
    if (filters?.priorities?.length) params['priorities'] = filters.priorities.join(',');
    if (filters?.assigneeIds?.length) params['assigneeIds'] = filters.assigneeIds.join(',');
    if (filters?.labels?.length) params['labels'] = filters.labels.join(',');
    if (filters?.activity?.length) params['activity'] = filters.activity.join(',');
    if (filters?.memberScope && filters.memberScope !== 'all') params['memberScope'] = filters.memberScope;
    if (filters?.completion && filters.completion !== 'all') params['completion'] = filters.completion;
    if (filters?.dueType && filters.dueType !== 'all') params['dueType'] = filters.dueType;

    return this.http.get<ApiResponse<{ items: Task[] }>>(`${this.baseUrl}/boards/${boardId}/tasks`, {
      params,
      withCredentials: true
    });
  }
  addTask(boardId: string, columnId: string, title: string, workspaceId: string, position?: number): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(
      `${this.baseUrl}/boards/${boardId}/columns/${columnId}/tasks`,
      { title, workspaceId, position },
      { withCredentials: true }
    );
  }

  updateTask(boardId: string, taskId: string, payload: UpdateTaskPayload): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(
      `${this.baseUrl}/boards/${boardId}/tasks/${taskId}`,
      payload,
      { withCredentials: true }
    );
  }

  reorderColumns(boardId: string, columnIds: string[]): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(
      `${this.baseUrl}/boards/${boardId}/columns/reorder`,
      { columnIds },
      { withCredentials: true }
    );
  }
}

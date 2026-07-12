import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';
import { environment } from '../../../../environments/environment';

export interface BoardDetailResponse {
  board: Board;
  columns: BoardColumn[];
}

export interface BoardListResponse {
  items: Board[];
}

@Injectable({ providedIn: 'root' })
export class BoardApiService {
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  createBoard(
    name: string,
    workspaceName: string,
    workspaceId: string,
    visibility: 'private' | 'workspace',
  ): Observable<ApiResponse<Board>> {
    return this.http.post<ApiResponse<Board>>(
      `${this.baseUrl}/boards`,
      { name, workspaceName, workspaceId, visibility },
      { withCredentials: true },
    );
  }

  getBoards(): Observable<ApiResponse<BoardListResponse>> {
    return this.http.get<ApiResponse<BoardListResponse>>(`${this.baseUrl}/boards`, {
      withCredentials: true,
    });
  }

  getBoardByWorkspace(workspaceId: string): Observable<ApiResponse<BoardListResponse>> {
    return this.http.get<ApiResponse<BoardListResponse>>(
      `${this.baseUrl}/workspaces/${workspaceId}/boards`,
      { withCredentials: true },
    );
  }

  getBoardById(boardId: string): Observable<ApiResponse<BoardDetailResponse>> {
    return this.http.get<ApiResponse<BoardDetailResponse>>(`${this.baseUrl}/boards/${boardId}`, {
      withCredentials: true,
    });
  }

  getBoardColumns(boardId: string): Observable<ApiResponse<{ columns: BoardColumn[] }>> {
    return this.http.get<ApiResponse<{ columns: BoardColumn[] }>>(
      `${this.baseUrl}/boards/${boardId}/columns`,
      { withCredentials: true },
    );
  }

  updateBoard(boardId: string, updates: Partial<Board>): Observable<ApiResponse<Board>> {
    return this.http.patch<ApiResponse<Board>>(
      `${this.baseUrl}/boards/${boardId}`,
      updates,
      { withCredentials: true },
    );
  }

  createColumn(
    boardId: string,
    workspaceId: string,
    name: string,
  ): Observable<ApiResponse<BoardColumn>> {
    return this.http.post<ApiResponse<BoardColumn>>(
      `${this.baseUrl}/columns`,
      { name, boardId, workspaceId },
      { withCredentials: true },
    );
  }

  reorderColumns(boardId: string, columnIds: string[]): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(
      `${this.baseUrl}/boards/${boardId}/reorder-columns`,
      { columnOrder: columnIds },
      { withCredentials: true },
    );
  }
  getArchivedItemsInBoard(boardId: string): Observable<ApiResponse<{ items: any[] }>> {
    return this.http.get<ApiResponse<{ items: any[] }>>(
      `${this.baseUrl}/boards/${boardId}/archive`,
      { withCredentials: true },
    );
  }
}
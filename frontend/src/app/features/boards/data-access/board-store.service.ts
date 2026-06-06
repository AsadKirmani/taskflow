import { inject, Injectable, signal, computed } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { BoardApiService } from './board-api.service';
import { BoardState, initialBoardState } from './board-state.model';
import { ColumnDropEventPayload } from '../models/drag-drop.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';

@Injectable({ providedIn: 'root' })
export class BoardStoreService {
  private readonly boardApi = inject(BoardApiService);
  private readonly notificationService = inject(NotificationService);

  private isAllBoardsLoaded = false;
  private readonly loadedBoardIdsCache = new Set<string>();
  private readonly loadedColumnBoardIdsCache = new Set<string>();
  private readonly loadingColumnBoardIdsCache = new Set<string>();


  private readonly stateSignal = signal<BoardState>(initialBoardState);
  
  readonly state = this.stateSignal.asReadonly();

  get currentBoardId(): string | null {
    return this.getState().board?.id ?? null;
  }

  get currentBoard(): Board | null {
    return this.getState().board;
  }

  get currentColumns(): BoardColumn[] {
    return this.getState().columns;
  }

  readonly viewModel = computed(() => {
    const s = this.stateSignal();
    return {
      boards: s.boards,
      board: s.board,
      columns: s.columns,
      loading: s.loading,
      saving: s.saving,
      error: s.error
    };
  });

  get allBoards(): Board[] {
    return this.getState().boards;
  }

  createBoard(name: string, workspaceName: string, workspaceId: string, visibility: 'private' | 'workspace'): void {
    this.boardApi.createBoard(name, workspaceName, workspaceId, visibility).pipe(
      tap(response => {
        const newBoard = this.normalizeBoard(response.data as Board & { _id?: string });
        const currentBoards = this.getState().boards;
        this.patchState({ boards: [...currentBoards, newBoard] });
        this.notificationService.success('Board created successfully');
      }),
      catchError(() => {
        this.notificationService.error('Failed to create board');
        return of(null);
      })
    ).subscribe();
  }

  createColumn(boardId: string, workspaceId: string, name: string): void {
    if (!boardId?.trim() || !workspaceId?.trim() || !name?.trim()) {
      this.notificationService.error('Board, workspace, and column name are required');
      return;
    }

    this.boardApi.createColumn(boardId, workspaceId, name.trim()).pipe(
      tap(response => {
        const newColumn = this.normalizeColumn(response.data as BoardColumn & { _id?: string });
        const currentColumns = this.getState().columns;
        this.loadedColumnBoardIdsCache.add(boardId);
        this.patchState({ columns: [...currentColumns, newColumn] });
        this.notificationService.success('Column created successfully');
      }),
      catchError(() => {
        this.notificationService.error('Failed to create column');
        return of(null);
      })
    ).subscribe();
  }

  loadAllBoards(forceUpdate = false): void {
    if (this.getState().loading) return;
    if (this.isAllBoardsLoaded && !forceUpdate) return;

    this.patchState({ loading: true, error: null });
    
    this.boardApi
      .getBoards()
      .pipe(
        map(response =>
          (response.data?.items ?? []).map(board =>
            this.normalizeBoard(board as Board & { _id?: string })
          )
        ),
        tap(boards => {
          this.isAllBoardsLoaded = true;
          this.notificationService.success('All boards loaded successfully');
          this.patchState({ boards, loading: false, error: null });
        }),
        catchError(() => {
          this.isAllBoardsLoaded = true;
          this.patchState({ boards: [], loading: false, error: 'Failed to load boards' });
          this.notificationService.error('Failed to load boards');
          return of([]);
        })
      )
      .subscribe();
  }

  loadBoardsByWorkspace(workspaceId: string, forceUpdate = false): void {
    if (this.getState().loading) return;
    
    if (this.isAllBoardsLoaded && !forceUpdate) {
      return;
    }

    this.patchState({ loading: true, error: null });
    
    this.boardApi
      .getBoards()
      .pipe(
        map(response =>
          (response.data?.items ?? [])
            .filter(board => board.workspaceId === workspaceId)
            .map(board => this.normalizeBoard(board as Board & { _id?: string }))
        ),
        tap(boards => {
          this.notificationService.success('Workspace boards synced successfully');
          this.patchState({ boards, loading: false, error: null });
        }),
        catchError(() => {
          this.patchState({ boards: [], loading: false, error: 'Failed to load workspace boards' });
          this.notificationService.error('Failed to load workspace boards');
          return of([]);
        })
      )
      .subscribe();
  }

  loadBoard(boardId: string, forceUpdate = false): void {
    if (!boardId?.trim()) {
      this.patchState({ loading: false, error: 'Board ID is missing' });
      this.notificationService.error('Board ID is missing');
      return;
    }

    if (this.loadedBoardIdsCache.has(boardId) && !forceUpdate) return;

    this.patchState({ loading: true, error: null });

    this.boardApi
      .getBoardById(boardId)
      .pipe(
        tap(response => {
          const payload = response.data as
            | {
                board?: (Board & { _id?: string }) | null;
                columns?: (BoardColumn & { _id?: string })[];
              }
            | (Board & { _id?: string })
            | null;

          const board = this.normalizeBoard(
            ((payload as { board?: Board & { _id?: string } | null })?.board ?? payload ?? {}) as Board & {
              _id?: string;
            }
          );
          const columns = this.normalizeColumns((payload as { columns?: (BoardColumn & { _id?: string })[] })?.columns ?? []);

          this.loadedBoardIdsCache.add(boardId);

          this.patchState({
            board,
            columns,
            loading: false,
            error: null
          });
        }),
        catchError(() => {
          this.patchState({
            loading: false,
            error: 'Failed to load board details'
          });
          this.notificationService.error('Failed to load board details');
          return of(null);
        })
      )
      .subscribe();
  }

  loadBoardColumns(boardId: string, forceUpdate = false): void {
    if (!boardId?.trim()) {
      this.notificationService.error('Board ID is missing');
      return;
    }

    if (this.loadingColumnBoardIdsCache.has(boardId)) return;
    if (this.loadedColumnBoardIdsCache.has(boardId) && !forceUpdate) return;

    this.loadingColumnBoardIdsCache.add(boardId);

    this.boardApi
      .getBoardColumns(boardId)
      .pipe(
        map(response =>
          this.normalizeColumns(
            (response.data?.columns ?? []) as (BoardColumn & { _id?: string })[]
          )
        ),
        tap(columns => {
          this.loadedColumnBoardIdsCache.add(boardId);
          this.loadingColumnBoardIdsCache.delete(boardId);
          this.patchState({ columns });
        }),
        catchError(() => {
          this.loadingColumnBoardIdsCache.delete(boardId);
          this.notificationService.error('Failed to load board columns');
          return of([]);
        })
      )
      .subscribe();
  }

  handleColumnDrop(event: ColumnDropEventPayload): void {
    if (event.fromIndex === event.toIndex) return;

    const snapshot = structuredClone(this.getState());
    const board = snapshot.board;
    if (!board?.id) return;

    const columns = [...snapshot.columns];
    const [moved] = columns.splice(event.fromIndex, 1);
    columns.splice(event.toIndex, 0, moved);
    this.patchState({ columns });

    this.boardApi
      .reorderColumns(board.id, columns.map(c => c.id))
      .pipe(
        tap(() => {
          this.notificationService.success('Columns reordered successfully');
        }),
        catchError(() => {
          this.stateSignal.set(snapshot);
          this.notificationService.error('Failed to reorder columns');
          return of(null);
        })
      )
      .subscribe();
  }

  private patchState(partial: Partial<BoardState>): void {
    this.stateSignal.update(current => ({
      ...current,
      ...partial
    }));
  }

  private getState(): BoardState {
    return this.stateSignal();
  }

  private normalizeBoard(board: Board & { _id?: string }): Board {
    return {
      ...board,
      id: board.id ?? board._id ?? ''
    };
  }

  private normalizeColumns(columns: (BoardColumn & { _id?: string })[]): BoardColumn[] {
    return columns.map(column => this.normalizeColumn(column));
  }

  private normalizeColumn(column: BoardColumn & { _id?: string }): BoardColumn {
    return {
      ...column,
      id: column.id ?? column._id ?? ''
    };
  }
}
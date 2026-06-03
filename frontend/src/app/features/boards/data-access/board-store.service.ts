import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { BoardApiService } from './board-api.service';
import { BoardState, initialBoardState } from './board-state.model';
import { ColumnDropEventPayload } from '../models/drag-drop.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';

@Injectable({ providedIn: 'root' })
export class BoardStoreService {
  private readonly api = inject(BoardApiService);
  private readonly notificationService = inject(NotificationService);
  private boardsLoaded = false;
  private readonly loadedBoardIds = new Set<string>();
  private readonly loadedColumnBoardIds = new Set<string>();
  private readonly loadingColumnBoardIds = new Set<string>();

  private readonly stateSubject = new BehaviorSubject<BoardState>(initialBoardState);
  readonly state$ = this.stateSubject.asObservable();

  get currentBoardId(): string | null {
    return this.getState().board?.id ?? null;
  }

  get currentBoard(): Board | null {
    return this.getState().board;
  }

  readonly vm$ = this.state$.pipe(
    map(state => ({
      boards: state.boards,
      board: state.board,
      columns: state.columns,
      loading: state.loading,
      saving: state.saving,
      error: state.error
    }))
  );

  createBoard(name: string, workspaceName: string, workspaceId: string, visibility: 'private' | 'workspace'): void {
    this.api.createBoard(name, workspaceName, workspaceId, visibility).pipe(
      tap(response => {
        const newBoard = response.data;
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

  loadBoards(force = false): void {
    if (this.getState().loading) {
      return;
    }

    if (this.boardsLoaded && !force) {
      return;
    }

    this.patchState({ loading: true, error: null });
    this.api
      .getBoards()
      .pipe(
        map(response =>
          (response.data?.items ?? []).map(board =>
            this.normalizeBoard(board as Board & { _id?: string })
          )
        ),
        tap(boards => {
          this.boardsLoaded = true;
          this.notificationService.success('Boards loaded successfully');
          this.patchState({ boards, loading: false, error: null });
        }),
        catchError(() => {
          this.boardsLoaded = true;
          this.patchState({ boards: [], loading: false, error: 'Failed to load boards' });
          this.notificationService.error('Failed to load boards');
          return of([]);
        })
      )
      .subscribe();
  }

  loadBoard(boardId: string, force = false): void {
    if (!boardId?.trim()) {
      this.patchState({ loading: false, error: 'Board ID is missing' });
      this.notificationService.error('Board ID is missing');
      return;
    }

    if (this.loadedBoardIds.has(boardId) && !force) {
      return;
    }

    this.patchState({ loading: true, error: null });

    this.api
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

          this.loadedBoardIds.add(boardId);

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
            error: 'Failed to load board'
          });
          this.notificationService.error('Failed to load board');
          return of(null);
        })
      )
      .subscribe();
  }

  getBoardColumns(boardId: string, force = false): void {
    if (!boardId?.trim()) {
      this.notificationService.error('Board ID is missing');
      return;
    }

    if (this.loadingColumnBoardIds.has(boardId)) {
      return;
    }

    if (this.loadedColumnBoardIds.has(boardId) && !force) {
      return;
    }

    this.loadingColumnBoardIds.add(boardId);

    this.api
      .getBoardColumns(boardId)
      .pipe(
        map(response =>
          this.normalizeColumns(
            (response.data?.columns ?? []) as (BoardColumn & { _id?: string })[]
          )
        ),
        tap(columns => {
          this.loadedColumnBoardIds.add(boardId);
          this.loadingColumnBoardIds.delete(boardId);
          this.patchState({ columns });
        }),
        catchError(() => {
          this.loadingColumnBoardIds.delete(boardId);
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

    this.api
      .reorderColumns(board.id, columns.map(c => c.id))
      .pipe(
        tap(() => {
          this.notificationService.success('Columns reordered');
        }),
        catchError(() => {
          this.stateSubject.next(snapshot);
          this.notificationService.error('Failed to reorder columns');
          return of(null);
        })
      )
      .subscribe();
  }

  private patchState(partial: Partial<BoardState>): void {
    this.stateSubject.next({
      ...this.getState(),
      ...partial
    });
  }

  private getState(): BoardState {
    return this.stateSubject.getValue();
  }

  private normalizeBoard(board: Board & { _id?: string }): Board {
    return {
      ...board,
      id: board.id ?? board._id ?? ''
    };
  }

  private normalizeColumns(columns: (BoardColumn & { _id?: string })[]): BoardColumn[] {
    return columns.map(column => ({
      ...column,
      id: column.id ?? column._id ?? ''
    }));
  }
}
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

  loadBoards(): void {
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
          this.notificationService.success('Boards loaded successfully');
          this.patchState({ boards, loading: false, error: null });
        }),
        catchError(() => {
          this.patchState({ boards: [], loading: false, error: 'Failed to load boards' });
          this.notificationService.error('Failed to load boards');
          return of([]);
        })
      )
      .subscribe();
  }

  loadBoard(boardId: string): void {
    if (!boardId?.trim()) {
      this.patchState({ loading: false, error: 'Board ID is missing' });
      this.notificationService.error('Board ID is missing');
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

  getBoardColumns(boardId: string): void {
    if (!boardId?.trim()) {
      this.notificationService.error('Board ID is missing');
      return;
    }

    this.api
      .getBoardColumns(boardId)
      .pipe(
        map(response =>
          this.normalizeColumns(
            (response.data?.columns ?? []) as (BoardColumn & { _id?: string })[]
          )
        ),
        tap(columns => {
          this.patchState({ columns });
        }),
        catchError(() => {
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
import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState, withHooks } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { BoardApiService } from './board-api.service';
import { BoardState, initialBoardState } from './board-state.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';
import { ColumnDropEventPayload } from '../models/drag-drop.model';
import { User } from '../../../core/models/user.model';
import { ArchiveService } from '../../../core/services/archive.service';
import { EventBusService } from '../../../core/services/event-bus.service';

type ExtendedBoardState = BoardState & {
  isAllBoardsLoaded: boolean;
  loadedBoardIds: string[];
  loadedColumnBoardIds: string[];
  loadingColumnBoardIds: string[];
  members?: User[];
};

const initialState: ExtendedBoardState = {
  ...initialBoardState,
  isAllBoardsLoaded: false,
  loadedBoardIds: [],
  loadedColumnBoardIds: [],
  loadingColumnBoardIds: [],
};

const normalizeBoard = (board: any): Board => ({ ...board, id: board.id ?? board._id ?? '' });
const normalizeColumn = (col: any): BoardColumn => ({ ...col, id: col.id ?? col._id ?? '' });
const normalizeColumns = (cols: any[]): BoardColumn[] => cols.map(normalizeColumn);
const normalizeMember = (member: any): User => ({ ...member, id: member.id ?? member._id ?? '' });

export const BoardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ board, boards, columns }) => ({
    currentBoardId: computed(() => board()?.id ?? null),
    currentBoard: computed(() => board()),
    currentColumns: computed(() => columns()),
    allBoards: computed(() => boards()),
  })),

  withMethods(
    (
      store,
      boardApi = inject(BoardApiService),
      notification = inject(NotificationService),
      archive = inject(ArchiveService),
    ) => ({
      async createBoard(
        name: string,
        workspaceName: string,
        workspaceId: string,
        visibility: 'private' | 'workspace',
      ) {
        try {
          const response = await firstValueFrom(
            boardApi.createBoard(name, workspaceName, workspaceId, visibility),
          );
          const newBoard = normalizeBoard(response.data);
          patchState(store, { boards: [...store.boards(), newBoard] });
          notification.success('Board created successfully');
        } catch (err) {
          notification.error('Failed to create board');
        }
      },

      async createColumn(boardId: string, workspaceId: string, name: string) {
        if (!boardId?.trim() || !workspaceId?.trim() || !name?.trim()) {
          notification.error('Board, workspace, and column name are required');
          return;
        }

        try {
          const response = await firstValueFrom(
            boardApi.createColumn(boardId, workspaceId, name.trim()),
          );
          const newColumn = normalizeColumn(response.data);

          const newLoadedCols = [...new Set([...store.loadedColumnBoardIds(), boardId])];

          patchState(store, {
            columns: [...store.columns(), newColumn],
            loadedColumnBoardIds: newLoadedCols,
          });
        } catch (err) {
          notification.error('Failed to create column');
        }
      },

      async loadAllBoards(forceUpdate = false) {
        if (store.loading() || (store.isAllBoardsLoaded() && !forceUpdate)) return;

        patchState(store, { loading: true, error: null });
        try {
          const response = await firstValueFrom(boardApi.getBoards());
          const boards = (response.data?.items ?? []).map(normalizeBoard);

          patchState(store, { boards, loading: false, isAllBoardsLoaded: true, error: null });
        } catch (err) {
          patchState(store, {
            boards: [],
            loading: false,
            error: 'Failed to load boards',
            isAllBoardsLoaded: true,
          });
          notification.error('Failed to load boards');
        }
      },

      async loadBoardsByWorkspace(workspaceId: string, forceUpdate = false) {
        if (store.loading() || (store.isAllBoardsLoaded() && !forceUpdate)) return;

        patchState(store, { loading: true, error: null });
        try {
          const response = await firstValueFrom(boardApi.getBoardByWorkspace(workspaceId));
          const boards = (response.data?.items ?? []).map(normalizeBoard);

          patchState(store, { boards, loading: false, error: null });
        } catch (err) {
          patchState(store, {
            boards: [],
            loading: false,
            error: 'Failed to load workspace boards',
          });
          notification.error('Failed to load workspace boards');
        }
      },

      async loadBoard(boardId: string, forceUpdate = false) {
        if (!boardId?.trim()) {
          notification.error('Board ID is missing');
          return;
        }

        if (store.loadedBoardIds().includes(boardId) && !forceUpdate) return;

        patchState(store, { loading: true, error: null });

        try {
          const response = await firstValueFrom(boardApi.getBoardById(boardId));

          const boardPayload = response.data as any;

          const board = normalizeBoard(boardPayload);

          const columns = normalizeColumns(boardPayload.columnOrder ?? []);

          const members = (boardPayload.memberIds || []).map(normalizeMember);

          patchState(store, {
            board,
            columns,
            members,
            loading: false,
            error: null,
            loadedBoardIds: [...new Set([...store.loadedBoardIds(), boardId])],
          });
        } catch (err) {
          patchState(store, { loading: false, error: 'Failed to load board details' });
          notification.error('Failed to load board details');
        }
      },
      async changeBoardVisibility(boardId: string, visibility: 'private' | 'workspace') {
        if (!boardId?.trim()) {
          notification.error('Board ID is missing');
          return;
        }

        try {
          const updatedBoard = await firstValueFrom(
            boardApi.updateBoard(boardId, { visibility }),
          );

          const normalizedBoard = normalizeBoard(updatedBoard.data);

          patchState(store, {
            boards: store.boards().map((b) => (b.id === boardId ? normalizedBoard : b)),
            board: store.board()?.id === boardId ? normalizedBoard : store.board(),
          });

          notification.success('Board visibility updated', 'The visibility of the board has been changed successfully.');
        } catch (err) {
          notification.error('Failed to update board visibility', 'An error occurred while trying to change the visibility of the board.');
        }
      },
      async handleColumnDrop(event: ColumnDropEventPayload) {
        if (event.fromIndex === event.toIndex) return;

        const board = store.board();
        if (!board?.id) return;

        const currentColumns = store.columns();
        const updatedColumns = [...currentColumns];
        const [moved] = updatedColumns.splice(event.fromIndex, 1);
        updatedColumns.splice(event.toIndex, 0, moved);

        patchState(store, { columns: updatedColumns });

        try {
          await firstValueFrom(
            boardApi.reorderColumns(
              board.id,
              updatedColumns.map((c) => c.id),
            ),
          );
        } catch (err) {
          patchState(store, { columns: currentColumns });
          notification.error('Failed to reorder columns');
        }
      },
      async archiveBoard(boardId: string, workspaceId: string, boardName: string, reason?: string) {
        const originalBoards = store.boards();

        patchState(store, { boards: originalBoards.filter((b) => b.id !== boardId) });

        try {
          await firstValueFrom(
            archive.archive({
              workspaceId,
              entityType: 'board',
              entityId: boardId,
              entityName: boardName,
              reason,
            }),
          );
          notification.success('Board archived successfully', 'The board has been archived successfully.');
        } catch (err) {
          patchState(store, { boards: originalBoards });
          notification.error('Failed to archive board', 'An error occurred while trying to archive the board.');
        }
      },

      async restoreBoard(boardId: string, workspaceId: string, boardName: string) {
        try {
          await firstValueFrom(
            archive.restore({
              workspaceId,
              entityType: 'board',
              entityId: boardId,
              entityName: boardName,
            }),
          );
          notification.success('Board restored', 'The board has been restored successfully.');
          await this.loadAllBoards(true);
        } catch (err) {
          notification.error('Failed to restore board', 'An error occurred while trying to restore the board.');
        }
      },

      async archiveColumn(
        columnId: string,
        workspaceId: string,
        columnName: string,
        reason?: string,
      ) {
        const originalColumns = store.columns();

        patchState(store, { columns: originalColumns.filter((c) => c.id !== columnId) });

        try {
          await firstValueFrom(
            archive.archive({
              workspaceId,
              entityType: 'column',
              entityId: columnId,
              entityName: columnName,
              reason,
            }),
          );
          notification.success('Column archived successfully', 'The column has been archived successfully.');
        } catch (err) {
          patchState(store, { columns: originalColumns });
          notification.error('Failed to archive column', 'An error occurred while trying to archive the column.');
        }
      },

      async restoreColumn(columnId: string, workspaceId: string) {
        try {
          await firstValueFrom(
            archive.restore({
              workspaceId,
              entityType: 'column',
              entityId: columnId,
            }),
          );
          notification.success('Column restored', 'The column has been restored successfully.');
          const currentBoardId = store.currentBoardId();
          if (currentBoardId) {
            await this.loadBoard(currentBoardId, true);
          }
        } catch (err) {
          notification.error('Failed to restore column', 'An error occurred while trying to restore the column.');
        }
      },
      async loadArchivedItemsInBoard(boardId: string) {
        try {
          const response = await firstValueFrom(boardApi.getArchivedItemsInBoard(boardId));
          return response.data.items;
        } catch (err) {
          notification.error('Failed to load archived items', 'An error occurred while trying to load archived items for the board.');
          return [];
        }
      },
      resetBoardState() {
        patchState(store, initialState);
      },
    }),
  ),
  )

import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { BoardApiService } from './board-api.service';
import { BoardState, initialBoardState, } from './board-state.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';
import { ColumnDropEventPayload } from '../models/drag-drop.model';
import { User } from '../../../core/models/user.model';

// --- Extended State ---
// Sets ko Arrays mein badal diya taaki immutability maintain rahe
type ExtendedBoardState = BoardState & {
  isAllBoardsLoaded: boolean;
  loadedBoardIds: string[];
  loadedColumnBoardIds: string[];
  loadingColumnBoardIds: string[];
  members?: User[]; // Added for board members mapping
};

const initialState: ExtendedBoardState = {
  ...initialBoardState,
  isAllBoardsLoaded: false,
  loadedBoardIds: [],
  loadedColumnBoardIds: [],
  loadingColumnBoardIds: []
};

// --- Pure Normalization Helpers ---
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
    allBoards: computed(() => boards())
  })),

  withMethods((
    store, 
    boardApi = inject(BoardApiService), 
    notification = inject(NotificationService)
  ) => ({

    async createBoard(name: string, workspaceName: string, workspaceId: string, visibility: 'private' | 'workspace') {
      try {
        const response = await firstValueFrom(boardApi.createBoard(name, workspaceName, workspaceId, visibility));
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
        const response = await firstValueFrom(boardApi.createColumn(boardId, workspaceId, name.trim()));
        const newColumn = normalizeColumn(response.data);
        
        // Caching id array me push kiya
        const newLoadedCols = [...new Set([...store.loadedColumnBoardIds(), boardId])];
        
        patchState(store, { 
          columns: [...store.columns(), newColumn],
          loadedColumnBoardIds: newLoadedCols
        });
        notification.success('Column created successfully');
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
        // Removed the annoying "All boards loaded" toast here!
      } catch (err) {
        patchState(store, { boards: [], loading: false, error: 'Failed to load boards', isAllBoardsLoaded: true });
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
        patchState(store, { boards: [], loading: false, error: 'Failed to load workspace boards' });
        notification.error('Failed to load workspace boards');
      }
    },

    async loadBoard(boardId: string, forceUpdate = false) {
      if (!boardId?.trim()) {
        patchState(store, { loading: false, error: 'Board ID is missing' });
        notification.error('Board ID is missing');
        return;
      }

      if (store.loadedBoardIds().includes(boardId) && !forceUpdate) return;

      patchState(store, { loading: true, error: null });

      try {
        const response = await firstValueFrom(boardApi.getBoardById(boardId));
        const payload = response.data as any;
        const board = normalizeBoard(payload.board ?? payload ?? {});
        const columns = normalizeColumns(payload.columns ?? []);
        const members = (board.memberIds || []).map(normalizeMember);

        patchState(store, {
          board,
          columns,
          members,
          loading: false,
          error: null,
          loadedBoardIds: [...new Set([...store.loadedBoardIds(), boardId])]
        });
      } catch (err) {
        patchState(store, { loading: false, error: 'Failed to load board details' });
        notification.error('Failed to load board details');
      }
    },

    async loadBoardColumns(boardId: string, forceUpdate = false) {
      if (!boardId?.trim()) {
        notification.error('Board ID is missing');
        return;
      }

      if (store.loadingColumnBoardIds().includes(boardId)) return;
      if (store.loadedColumnBoardIds().includes(boardId) && !forceUpdate) return;

      patchState(store, { loadingColumnBoardIds: [...store.loadingColumnBoardIds(), boardId] });

      try {
        const response = await firstValueFrom(boardApi.getBoardColumns(boardId));
        const columns = normalizeColumns(response.data?.columns ?? []);
        
        patchState(store, { 
          columns,
          loadedColumnBoardIds: [...new Set([...store.loadedColumnBoardIds(), boardId])],
          loadingColumnBoardIds: store.loadingColumnBoardIds().filter(id => id !== boardId)
        });
      } catch (err) {
        patchState(store, { loadingColumnBoardIds: store.loadingColumnBoardIds().filter(id => id !== boardId) });
        notification.error('Failed to load board columns');
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
      
      // Optimistic UI Update
      patchState(store, { columns: updatedColumns });

      try {
        await firstValueFrom(boardApi.reorderColumns(board.id, updatedColumns.map(c => c.id)));
        notification.success('Columns reordered successfully');
      } catch (err) {
        // Rollback snapshot on error
        patchState(store, { columns: currentColumns });
        notification.error('Failed to reorder columns');
      }
    }

  }))
);
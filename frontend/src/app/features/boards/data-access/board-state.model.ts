import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';
import { Task, TaskPriority } from '../../../core/models/task.model';

export type BoardDueType = 'all' | 'overdue' | 'today' | 'this_week';

export interface BoardFilters {
  search: string;
  priorities: TaskPriority[];
  assigneeIds: string[];
  labels: string[];
  dueType: BoardDueType;
}

export interface BoardState {
  boards: Board[];
  board: Board | null;
  columns: BoardColumn[];
  tasksById: Record<string, Task>;
  taskIdsByColumn: Record<string, string[]>;
  filters: BoardFilters;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialBoardState: BoardState = {
  boards: [],
  board: null,
  columns: [],
  tasksById: {},
  taskIdsByColumn: {},
  filters: {
    search: '',
    priorities: [],
    assigneeIds: [],
    labels: [],
    dueType: 'all'
  },
  loading: false,
  saving: false,
  error: null
};
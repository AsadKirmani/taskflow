import { Board } from '../../../core/models/board.model';
import { BoardColumn } from '../../../core/models/column.model';
import { Task, TaskPriority } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';

export type BoardDueType = 'all' | 'none' | 'overdue' | 'today' | 'this_week';
export type BoardMemberScope = 'all' | 'no_members' | 'me';
export type BoardCompletionType = 'all' | 'completed' | 'incomplete';
export type BoardActivityType =
  | 'recentlyupdated'
  | 'recentlycreated'
  | 'activeinlastweek'
  | 'activeinlastmonth';

export interface BoardFilters {
  search: string;
  priorities: TaskPriority[];
  assigneeIds: string[];
  currentUserId: string | null;
  memberScope: BoardMemberScope;
  completion: BoardCompletionType;
  labels: string[];
  dueType: BoardDueType;
  activity: BoardActivityType[];
}

export interface BoardState {
  boards: Board[];
  board: Board | null;
  columns: BoardColumn[];
  members: User[];
  filters: BoardFilters;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialBoardState: BoardState = {
  boards: [],
  board: null,
  columns: [],
  members: [],
  filters: {
    search: '',
    priorities: [],
    assigneeIds: [],
    currentUserId: null,
    memberScope: 'all',
    completion: 'all',
    labels: [],
    dueType: 'all',
    activity: []
  },
  loading: false,
  saving: false,
  error: null
};
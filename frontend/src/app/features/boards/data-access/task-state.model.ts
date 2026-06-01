import { Task } from '../../../core/models/task.model';
import { BoardFilters } from './board-state.model';

export interface TaskState {
  tasksById: Record<string, Task>;
  taskIdsByColumn: Record<string, string[]>;
  filters: BoardFilters;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialTaskState: TaskState = {
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

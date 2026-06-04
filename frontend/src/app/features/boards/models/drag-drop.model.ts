export interface TaskDropEventPayload {
  taskId: string;
  sourceColumnId: string;
  targetColumnId: string;
  sourceIndex: number;
  targetIndex: number;
}

export interface ColumnDropEventPayload {
  fromIndex: number;
  toIndex: number;
}

export interface AddTaskEventPayload {
  columnId: string;
  title: string;
}

export interface AddColumnEventPayload {
  title: string;
}

export interface UpdateTaskEventPayload {
  taskId: string;
  title: string;
}

export interface ToggleTaskCompletionEventPayload {
  taskId: string;
  isCompleted: boolean;
}

export interface ActivityRef {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
}

export interface ActivityItem {
  _id?: string;
  id?: string;
  workspaceId: string;
  boardId?: string | ActivityRef | null;
  columnId?: string | ActivityRef | null;
  taskId?: string | ActivityRef | null;
  userId: string | ActivityRef;
  actionType: string;
  entityType: 'workspace' | 'board' | 'column' | 'task' | 'comment';
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityListData {
  items: ActivityItem[];
  total: number;
  page: number;
  limit: number;
}

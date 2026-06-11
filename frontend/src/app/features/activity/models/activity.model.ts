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

export function formatActivityAction(actionType: string): string {
  const safeAction = (actionType || '').trim().toLowerCase();
  
  const actionMap: Record<string, string> = {
    workspace_created: 'created',
    workspace_updated: 'updated',
    workspace_member_invited: 'invited a member to',
    board_created: 'created',
    board_updated: 'updated',
    board_archived: 'archived',
    board_restored: 'restored',
    column_created: 'created',
    column_updated: 'updated',
    column_archived: 'archived',
    column_restored: 'restored',
    task_created: 'created',
    task_updated: 'updated',
    task_completed: 'completed',
    task_reopened: 'reopened',
    task_moved: 'moved',
    task_archived: 'archived',
    task_restored: 'restored',
    comment_created: 'commented on',
    comment_updated: 'edited a comment on'
  };

  if (actionMap[safeAction]) {
    return actionMap[safeAction];
  }

  return safeAction
    .split('_')
    .filter(Boolean)
    .join(' ')
    .toLowerCase(); 
}
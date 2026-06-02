import { activityRepository } from './activity.repository';

export const activityService = {
  async logActivity(data: {
    workspaceId: string;
    userId: string;
    actionType: string;
    entityType: 'workspace' | 'board' | 'column' | 'task' | 'comment';
    entityId: string;
    boardId?: string;
    columnId?: string;
    taskId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return activityRepository.logActivity(data);
  },

  async getWorkspaceActivity(workspaceId: string, page: number, limit: number) {
    return activityRepository.getWorkspaceActivity(workspaceId, page, limit);
  },

  async getBoardActivity(workspaceId: string, boardId: string, page: number, limit: number) {
    return activityRepository.getBoardActivity(workspaceId, boardId, page, limit);
  },

  async getTaskActivity(taskId: string, page: number, limit: number) {
    return activityRepository.getTaskActivity(taskId, page, limit);
  }
};

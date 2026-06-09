import { workspaceRepository } from '../workspaces/workspace.repository';
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
  async getGlobalActivity(userId: string, page: number, limit: number) {
    const userWorkspaces = await workspaceRepository.listUserWorkspaces(userId);
    const workspaceIds = userWorkspaces.map(ws => ws._id.toString());

    if (workspaceIds.length === 0) {
      return { items: [], total: 0 };
    }

    return activityRepository.getGlobalActivity(workspaceIds, page, limit);
  },

  async getWorkspaceActivity(userId: string, workspaceId: string, page: number, limit: number) {
    return activityRepository.getWorkspaceActivity(workspaceId, page, limit);
  },

  async getBoardActivity(userId: string, workspaceId: string, boardId: string, page: number, limit: number) {
    return activityRepository.getBoardActivity(workspaceId, boardId, page, limit);
  },

  async getTaskActivity(userId: string, taskId: string, page: number, limit: number) {
    return activityRepository.getTaskActivity(taskId, page, limit);
  }
};

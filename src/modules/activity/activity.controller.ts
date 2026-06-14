import { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { activityService } from './activity.service';
import { PERMISSION } from '../../config/roles';
import { PermissionService } from '../../services/permission.service';
import { taskService } from '../tasks/task.service';

const parsePagination = (req: Request) => {
  const pageRaw = Number(req.query.page ?? 1);
  const limitRaw = Number(req.query.limit ?? 30);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0
    ? Math.min(Math.floor(limitRaw), 100)
    : 30;

  return { page, limit };
};

export const activityController = {
  async getGlobalActivity(req: Request, res: Response) {
    const { page, limit } = parsePagination(req);
    const userId = req.auth!.userId;
    const result = await activityService.getGlobalActivity(userId, page, limit);
    res.json({ success: true, data: { ...result, page, limit } });
  },
  async getWorkspaceActivity(req: Request, res: Response) {

    const { workspaceId } = req.params as { workspaceId: string };
    const { page, limit } = parsePagination(req);
    const userId = req.auth!.userId;
    await PermissionService.ensure(
      userId,
      workspaceId,
      PERMISSION.ACTIVITY_LOG_VIEW
    );
    const result = await activityService.getWorkspaceActivity(userId, workspaceId, page, limit);
    res.json({ success: true, data: { ...result, page, limit } });
  },

  async getBoardActivity(req: Request, res: Response) {

    const { workspaceId, boardId } = req.params as { workspaceId: string; boardId: string };
    const { page, limit } = parsePagination(req);
    const userId = req.auth!.userId;
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId },
      PERMISSION.BOARD_VIEW
    );
    const result = await activityService.getBoardActivity(userId, workspaceId, boardId, page, limit);
    res.json({ success: true, data: { ...result, page, limit } });
  },

  async getTaskActivity(req: Request, res: Response) {
    const { taskId } = req.params as { taskId: string };
    const { page, limit } = parsePagination(req);
    const task = await taskService.getTaskById(taskId);
    const userId = req.auth!.userId;
    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: task.workspaceId.toString() },
      PERMISSION.BOARD_VIEW,
    )
    const result = await activityService.getTaskActivity(userId, taskId, page, limit);
    res.json({ success: true, data: { ...result, page, limit } });
  }
};

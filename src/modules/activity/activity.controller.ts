import { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { activityService } from './activity.service';

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
  async getWorkspaceActivity(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { workspaceId } = req.params as { workspaceId: string };
    const { page, limit } = parsePagination(req);

    const result = await activityService.getWorkspaceActivity(workspaceId, page, limit);
    res.json({ success: true, data: { ...result, page, limit } });
  },

  async getBoardActivity(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { workspaceId, boardId } = req.params as { workspaceId: string; boardId: string };
    const { page, limit } = parsePagination(req);

    const result = await activityService.getBoardActivity(workspaceId, boardId, page, limit);
    res.json({ success: true, data: { ...result, page, limit } });
  },

  async getTaskActivity(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { taskId } = req.params as { taskId: string };
    const { page, limit } = parsePagination(req);

    const result = await activityService.getTaskActivity(taskId, page, limit);
    res.json({ success: true, data: { ...result, page, limit } });
  }
};

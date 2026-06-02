import { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { archiveService } from './archive.service';

export const archiveController = {
  async archiveEntity(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { workspaceId, entityType, entityId, reason } = req.body as {
      workspaceId: string;
      entityType: 'board' | 'column' | 'task';
      entityId: string;
      reason?: string;
    };

    const result = await archiveService.archiveEntity({
      workspaceId,
      entityType,
      entityId,
      reason,
      userId: req.auth.userId
    });

    if (!result) {
      throw new AppError('Entity not found', 404, 'NOT_FOUND');
    }

    res.status(201).json({ success: true, data: result });
  },

  async restoreEntity(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { workspaceId, entityType, entityId } = req.body as {
      workspaceId: string;
      entityType: 'board' | 'column' | 'task';
      entityId: string;
    };

    const updated = await archiveService.restoreEntity({
      workspaceId,
      entityType,
      entityId,
      userId: req.auth.userId
    });

    if (!updated) {
      throw new AppError('Entity not found', 404, 'NOT_FOUND');
    }

    res.json({ success: true, data: updated });
  },

  async listArchived(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { workspaceId } = req.params as { workspaceId: string };
    const entityType = req.query.entityType as 'board' | 'column' | 'task' | undefined;
    const includeRestored = req.query.includeRestored === 'true';

    const items = await archiveService.listArchived(workspaceId, {
      entityType,
      includeRestored
    });

    res.json({ success: true, data: { items } });
  }
};

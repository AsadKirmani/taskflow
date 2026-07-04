import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { archiveService } from "./archive.service";
import { redisClient } from "../../config/redis";

export const archiveController = {
  async archiveEntity(req: Request, res: Response) {
    const { workspaceId, entityType, entityId, reason } = req.body as {
      workspaceId: string;
      entityType: "board" | "column" | "task";
      entityId: string;
      reason?: string;
    };

    const result = await archiveService.archiveEntity({
      workspaceId,
      entityType,
      entityId,
      reason,
      userId: req.auth!.userId,
    });

    if (!result) {
      throw new AppError(
        "Entity not found or already archived",
        400,
        "BAD_REQUEST",
      );
    }

    if (entityType === "board") {
      await redisClient.del(`workspace:${workspaceId}:boards`);
      await redisClient.del(`user:${req.auth!.userId}:all_boards`);
      await redisClient.del(`board:${entityId}:detail`);
    } else if (entityType === "column" || entityType === "task") {
      const boardId = result.updated.boardId?.toString();
      if (boardId) {
        await redisClient.del(`board:${boardId}:detail`);
      }
    }

    res.status(201).json({ success: true, data: result });
  },

  async restoreEntity(req: Request, res: Response) {
    const { workspaceId, entityType, entityId } = req.body as {
      workspaceId: string;
      entityType: "board" | "column" | "task";
      entityId: string;
    };

    const updated = await archiveService.restoreEntity({
      workspaceId,
      entityType,
      entityId,
      userId: req.auth!.userId,
    });

    if (!updated) {
      throw new AppError(
        "Entity not found or already restored",
        400,
        "BAD_REQUEST",
      );
    }

    if (entityType === "board") {
      await redisClient.del(`workspace:${workspaceId}:boards`);
      await redisClient.del(`user:${req.auth!.userId}:all_boards`);
      await redisClient.del(`board:${entityId}:detail`);
    } else if (entityType === "column" || entityType === "task") {
      const boardId = updated.boardId?.toString();
      if (boardId) {
        await redisClient.del(`board:${boardId}:detail`);
      }
    }

    res.json({ success: true, data: updated });
  },

  async listArchived(req: Request, res: Response) {
    const { workspaceId } = req.params as { workspaceId: string };
    const entityType = req.query.entityType as
      "board" | "column" | "task" | undefined;
    const includeRestored = req.query.includeRestored === "true";

    const items = await archiveService.listArchived(workspaceId, {
      entityType,
      includeRestored,
    });

    res.json({ success: true, data: { items } });
  },
};

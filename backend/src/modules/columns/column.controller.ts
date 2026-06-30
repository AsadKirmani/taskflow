import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSION } from "../../config/roles";
import { columnService } from "./column.service";
import { boardService } from "../boards/board.service";
import { redisClient } from "../../config/redis";

export const columnController = {
  async createColumn(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { name, boardId, workspaceId } = req.body as {
      name: string;
      boardId: string;
      workspaceId: string;
    };

    if (!boardId || !workspaceId) {
      throw new AppError(
        "boardId and workspaceId are required in the request body",
        400,
        "BAD_REQUEST",
      );
    }

    const board = await boardService.getBoardById(userId, boardId);
    if (!board || board.workspaceId.toString() !== workspaceId) {
      throw new AppError(
        "Invalid Board or Workspace combination",
        400,
        "BAD_REQUEST",
      );
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId },
      PERMISSION.COLUMN_CREATE,
    );
    const column = await columnService.createColumn(
      name,
      boardId,
      workspaceId,
      userId,
    );
    await redisClient.del(`board:${boardId}:detail`); // Invalidate the cache for columns in this board
    res.status(201).json({ success: true, data: column });
  },

  async updateColumn(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { columnId } = req.params as { columnId: string };
    const { name, archived } = req.body as {
      name?: string;
      archived?: boolean;
    };

    const column = await columnService.getColumnById(columnId);
    if (!column) {
      throw new AppError("Column not found", 404, "NOT_FOUND");
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: column.workspaceId.toString() },
      PERMISSION.COLUMN_EDIT,
    );

    const updatedColumn = await columnService.updateColumn(
      columnId,
      { name, archived },
      userId,
    );
    await redisClient.del(`board:${column.boardId.toString()}:detail`); // Invalidate the cache for columns in this board
    res.json({ success: true, data: updatedColumn });
  },

  async getColumnsByBoardId(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };

    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    await PermissionService.ensureColumnPermission(
      userId,
      { workspaceId: board.workspaceId.toString() },
      PERMISSION.COLUMN_VIEW,
    );

    const columns = await columnService.getColumnsByBoardId(boardId, userId);
    res.json({ success: true, data: { columns } });
  },

  async reorderTasks(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { columnId } = req.params as { columnId: string };
    const { taskIds } = req.body as { taskIds: string[] };

    const column = await columnService.getColumnById(columnId);
    if (!column) {
      throw new AppError("Column not found", 404, "NOT_FOUND");
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: column.workspaceId.toString() },
      PERMISSION.TASK_EDIT,
    );
    await columnService.reorderTasks(columnId, taskIds, userId);
    await redisClient.del(`board:${column.boardId.toString()}:detail`); // Invalidate the cache for this board's detail
    res.json({ success: true });
  },
};

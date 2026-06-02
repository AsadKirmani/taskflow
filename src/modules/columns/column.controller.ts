import { columnService } from "./column.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";

export const columnController = {
  async createColumn(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { boardId, workspaceId } = req.params as {
      boardId: string;
      workspaceId: string;
    };
    const { name } = req.body as { name: string };
    const column = await columnService.createColumn(
      name,
      boardId,
      workspaceId,
      req.auth.userId,
    );
    res.status(201).json(column);
  },
  async updateColumn(req: Request, res: Response) {
    if (!req.auth?.userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { columnId } = req.params as { columnId: string };
    const { name, archived } = req.body as {
      name?: string;
      archived?: boolean;
    };
    const updatedColumn = await columnService.updateColumn(columnId, {
      name,
      archived,
    }, req.auth.userId);
    res.json(updatedColumn);
  },
  async reorderTasks(req: Request, res: Response) {
    if (!req.auth?.userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { columnId } = req.params as { columnId: string };
    const { taskIds } = req.body as { taskIds: string[] };
    // Placeholder for reordering tasks logic
    res.json({
      success: true,
      message: "Tasks reordered successfully",
      data: null,
    });
  },
  async getColumnsByBoardId(req: Request, res: Response) {
    if (!req.auth?.userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { boardId } = req.params as { boardId: string };
    const columns = await columnService.getColumnsByBoardId(boardId);
    res.json({ success: true, data: { columns } });
  },
  async reorderColumns(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { columnIds } = req.body as { columnIds: string[] };
    if (!Array.isArray(columnIds) || columnIds.length === 0) {
      throw new AppError("columnIds must be a non-empty array", 400, "BAD_REQUEST");
    }
    await columnService.reorderColumns(columnIds);
    res.json({ success: true, data: null });
  }
};
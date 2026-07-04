import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSION } from "../../config/roles";
import { boardService } from "./board.service";
import { redisClient } from "../../config/redis";
import { BoardModel } from "../../models/board.model";

export const boardController = {
  async createBoard(req: Request, res: Response, next: NextFunction) {
    const userId = req.auth!.userId;
    const { name, description, visibility, workspaceId } = req.body;

    if (!workspaceId) {
      throw new AppError(
        "workspaceId is required in the request body",
        400,
        "BAD_REQUEST",
      );
    }
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId },
      PERMISSION.BOARD_CREATE,
    );
    try {
      const board = await boardService.createBoard(req.body, userId);
      await redisClient.del(`workspace:${workspaceId}:boards`);
      await redisClient.del(`user:${userId}:all_boards`);
      res.status(201).json({ success: true, data: board });
    } catch (error) {
      return next(
        new AppError(
          "Failed to create board",
          500,
          "INTERNAL_SERVER_ERROR",
          error,
        ),
      );
    }
  },

  async getBoardById(req: Request, res: Response, next: NextFunction) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };
    let board: any;
    const cacheKey = `board:${boardId}:detail`;
    const cachedBoard = await redisClient.get(cacheKey);
    if (cachedBoard) {
      board = cachedBoard;
    } else {
      board = await boardService.getBoardById(userId, boardId);
      if (!board) {
        return next(new AppError("Board not found", 404, "NOT_FOUND"));
      }
      await redisClient.set(cacheKey, JSON.stringify(board), { ex: 3600 });
    }
    const responsePayload = { success: true, data: board };
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: board.workspaceId.toString() },
      PERMISSION.BOARD_VIEW,
    );

    return res.json(responsePayload);
  },

  async getBoardsInWorkspace(req: Request, res: Response, next: NextFunction) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    const cacheKey = `workspace:${workspaceId}:boards`;

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId },
      PERMISSION.BOARD_VIEW,
    );
    const cachedBoards = await redisClient.get(cacheKey);
    if (cachedBoards) {
      return res.json({ success: true, data: { items: cachedBoards } });
    }
    const boards = await boardService.getBoardsInWorkspace(workspaceId, userId);
    await redisClient.set(cacheKey, JSON.stringify(boards), { ex: 3600 });
    const responseData = { success: true, data: { items: boards } };

    return res.json(responseData);
  },

  async updateBoard(req: Request, res: Response, next: NextFunction) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };

    const existingBoard = await boardService.getBoardById(userId, boardId);
    if (!existingBoard) {
      return next(new AppError("Board not found", 404, "NOT_FOUND"));
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: existingBoard.workspaceId.toString() },
      PERMISSION.BOARD_EDIT,
    );

    const updatedBoard = await boardService.updateBoard(
      boardId,
      req.body,
      userId,
    );
    await redisClient.del(`board:${boardId}:detail`);
    await redisClient.del(
      `workspace:${existingBoard.workspaceId.toString()}:boards`,
    );
    await redisClient.del(`user:${userId}:all_boards`);
    res.json({ success: true, data: updatedBoard });
  },

  async getBoards(req: Request, res: Response, next: NextFunction) {
    const userId = req.auth!.userId;
    const cacheKey = `user:${userId}:all_boards`;
    const cachedBoards = await redisClient.get(cacheKey);
    if (cachedBoards) {
      return res.json({ success: true, data: { items: cachedBoards } });
    }
    const boards = await boardService.getBoards(userId);
    await redisClient.set(cacheKey, JSON.stringify(boards), { ex: 3600 });
    const responseData = { success: true, data: { items: boards } };
    return res.json(responseData);
  },

  async reorderColumns(req: Request, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params as { boardId: string };
      const { columnOrder } = req.body as { columnOrder: string[] };
      const userId = req.auth!.userId;
      const board = await boardService.getBoardById(userId, boardId);
      if (!board) {
        return next(new AppError("Board not found", 404, "NOT_FOUND"));
      }
      await PermissionService.ensureBoardPermission(
        userId,
        { workspaceId: board.workspaceId.toString() },
        PERMISSION.BOARD_EDIT,
      );

      await boardService.reorderColumns(boardId, columnOrder, userId);
      await redisClient.del(`board:${boardId}:detail`);
      res.json({ success: true, message: "Column order updated" });
    } catch (error) {
      return next(
        new AppError(
          "Failed to reorder columns",
          500,
          "INTERNAL_SERVER_ERROR",
          error,
        ),
      );
    }
  },
  async deleteBoard(req: Request, res: Response, next: NextFunction) {
    const { boardId } = req.params as { boardId: string };
    const userId = req.auth!.userId;

    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      return next(new AppError("Board not found", 404, "NOT_FOUND"));
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: board.workspaceId.toString() },
      PERMISSION.BOARD_DELETE,
    );
    await boardService.deleteBoard(boardId, userId);

    await redisClient.del(`board:${boardId}:detail`);
    await redisClient.del(`workspace:${board.workspaceId.toString()}:boards`);
    await redisClient.del(`user:${userId}:all_boards`);
    res.json({ success: true, message: "Board deleted successfully" });
  },
};

import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";

import { boardService } from "./board.service";
export const boardController = {
  async createBoard(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { workspaceId } = req.params as { workspaceId: string };
    const board = await boardService.createBoard(
      req.body,
      req.auth.userId,
      workspaceId,
    );
    res.status(201).json({ success: true, data: board });
  },
  async getBoardById(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { boardId } = req.params as { boardId: string };
    const board = await boardService.getBoardById(boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }
    res.json({ success: true, data: board });
  },
  async getBoardsInWorkspace(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { workspaceId } = req.params as { workspaceId: string };
    const boards = await boardService.getBoardsInWorkspace(
      workspaceId,
      req.auth.userId,
    );
    res.json({ success: true, data: { items: boards } });
  },
  async updateBoard(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { boardId } = req.params as { boardId: string };
    const updatedBoard = await boardService.updateBoard(boardId, req.body, req.auth.userId);
    res.json({ success: true, data: updatedBoard });
  },
  async getBoards(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const boards = await boardService.getBoards(req.auth.userId);
    res.json({ success: true, data: { items: boards } });
  }
};

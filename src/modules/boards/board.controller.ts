import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSION } from "../../config/roles";
import { boardService } from "./board.service";

export const boardController = {
  async createBoard(req: Request, res: Response) {
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
    const board = await boardService.createBoard(req.body, userId);

    res.status(201).json({ success: true, data: board });
  },

  async getBoardById(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };

    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: board.workspaceId.toString() },
      PERMISSION.BOARD_VIEW,
    );

    res.json({ success: true, data: board });
  },

  async getBoardsInWorkspace(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    const boards = await boardService.getBoardsInWorkspace(workspaceId, userId);
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId },
      PERMISSION.BOARD_VIEW,
    );
    res.json({ success: true, data: { items: boards } });
  },

  async updateBoard(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };

    const existingBoard = await boardService.getBoardById(userId, boardId);
    if (!existingBoard) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
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
    res.json({ success: true, data: updatedBoard });
  },

  async getBoards(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const boards = await boardService.getBoards(userId);
    res.json({ success: true, data: { items: boards } });
  },

  async reorderColumns(req: Request, res: Response) {
    const { boardId } = req.params as { boardId: string };
    const { columnIds } = req.body as { columnIds: string[] };
    const userId = req.auth!.userId;

    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: board.workspaceId.toString() },
      PERMISSION.BOARD_EDIT,
    );

    await boardService.reorderColumns(boardId, columnIds, userId);
    res.json({ success: true, message: "Column order updated" });
  },
  async deleteBoard(req: Request, res: Response) {
    const { boardId } = req.params as { boardId: string };
    const userId = req.auth!.userId;

    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: board.workspaceId.toString() },
      PERMISSION.BOARD_DELETE,
    );

    await boardService.deleteBoard(boardId, userId);
    res.json({ success: true, message: "Board deleted successfully" });
  },
};

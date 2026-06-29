import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSION } from "../../config/roles";
import { boardService } from "./board.service";
import { redisClient } from "../../config/redis";

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
    //await redisClient.del(`workspace:${workspaceId}:boards`); // Invalidate the cache for boards in this workspace
    //await redisClient.del(`user:${userId}:all_boards`); // Invalidate the cache for all boards for this user
    res.status(201).json({ success: true, data: board });
  },

  async getBoardById(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };

    
    let responsePayload: any;
      const board = await boardService.getBoardById(userId, boardId);
      if (!board) {
        throw new AppError("Board not found", 404, "NOT_FOUND");
      }
      responsePayload = { success: true, data: board };

    // 🛡️ 3. SECURITY CHECK NOW (Cache se aane par bhi permission check hogi!)
    // Hum payload ke andar se workspaceId nikal rahe hain
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: responsePayload.data.workspaceId.toString() },
      PERMISSION.BOARD_VIEW,
    );
    
    return res.json(responsePayload);
  },
  
  async getBoardsInWorkspace(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    
    // 🛡️ 1. SECURITY FIRST: Pehle permission check karo
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId },
      PERMISSION.BOARD_VIEW,
    );
    
    const boards = await boardService.getBoardsInWorkspace(workspaceId, userId);

    const responseData = { success: true, data: { items: boards } };
    
    return res.json(responseData);
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
   const start = performance.now();
    const userId = req.auth!.userId; 
    const boards = await boardService.getBoards(userId);
    const responseData = { success: true, data: { items: boards } };
    return res.json(responseData);
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
    // Yeh line teri pehle se likhi hai:
//await redisClient.del(`board:${boardId}`);

// 👇 YEH NAYI LINE ADD KAR DE (Taaki all_boards bhi refresh ho jaye):
//await redisClient.del(`user:${userId}:all_boards`);
    res.json({ success: true, message: "Board deleted successfully" });
  },
};
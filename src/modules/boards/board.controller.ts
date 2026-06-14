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
    await redisClient.del(`workspace:${workspaceId}:boards`);

    res.status(201).json({ success: true, data: board });
  },

  async getBoardById(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };
    const cacheKey = `board:${boardId}`;

    let responsePayload: any;
    let isCached = false;

    // ⚡ 1. Pehle Redis se check karo
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`🚀 Cache Hit: Board ${boardId}`);
      responsePayload = cachedData; // Yaad rahe tera payload {success: true, data: board} format me hai
      isCached = true;
    } else {
      console.log(`🐢 Cache Miss: Fetching Board ${boardId} from DB`);
      const board = await boardService.getBoardById(userId, boardId);
      if (!board) {
        throw new AppError("Board not found", 404, "NOT_FOUND");
      }
      responsePayload = { success: true, data: board };
    }

    // 🛡️ 2. SECURITY CHECK FIRST (Cache se aaye ya DB se, yeh check hamesha hoga!)
    // Hum payload ke andar se workspaceId nikal rahe hain
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: responsePayload.data.workspaceId.toString() },
      PERMISSION.BOARD_VIEW,
    );

    // 💾 3. Agar data DB se laya tha (Cache Miss), toh agli baar ke liye Redis me daal do
    if (!isCached) {
      await redisClient.set(cacheKey, responsePayload, {
        ex: 3600, // 3600 seconds = 1 Hour
      });
    }

    // 4. Khushi-khushi user ko response bhej do
    res.json(responsePayload);
  },

  async getBoardsInWorkspace(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    
    // 🛡️ 1. SECURITY FIRST: Cache ya DB check karne se pehle Permission confirm karo
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId },
      PERMISSION.BOARD_VIEW,
    );

    const cacheKey = `workspace:${workspaceId}:boards`;

    // ⚡ 2. Redis se check karo
    const cachedBoards = await redisClient.get(cacheKey);
    if (cachedBoards) {
      console.log(`🚀 Cache Hit: Workspace ${workspaceId} boards`);
      // Upstash khud parsed object deta hai, toh seedha bhej do
      return res.status(200).json(cachedBoards); 
    }

    console.log(`🐢 Cache Miss: Fetching workspace ${workspaceId} boards from DB`);
    // 🐌 3. Agar Redis me nahi hai toh DB se lo
    const boards = await boardService.getBoardsInWorkspace(workspaceId, userId);

    // 💾 4. Redis me set karo (BINA JSON.stringify ke)
    const responseData = { success: true, data: { items: boards } };
    await redisClient.set(cacheKey, responseData, {
      ex: 3600, // 3600 seconds = 1 Hour
    });

    res.json(responseData);
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
    await redisClient.del(`workspace:${existingBoard.workspaceId.toString()}:boards`);
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
    await redisClient.del(`workspace:${board.workspaceId.toString()}:boards`);
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
    await redisClient.del(`workspace:${board.workspaceId.toString()}:boards`);
    res.json({ success: true, message: "Board deleted successfully" });
  },
};

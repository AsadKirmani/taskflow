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
    await redisClient.del(`workspace:${workspaceId}:boards`); // Invalidate the cache for boards in this workspace
    await redisClient.del(`user:${userId}:all_boards`); // Invalidate the cache for all boards for this user
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
      responsePayload = cachedData; 
      isCached = true;
    } else {
      console.log(`🐢 Cache Miss: Fetching Board ${boardId} from DB`);
      // 🐌 2. Agar cache me nahi hai toh DB se laao
      const board = await boardService.getBoardById(userId, boardId);
      if (!board) {
        throw new AppError("Board not found", 404, "NOT_FOUND");
      }
      responsePayload = { success: true, data: board };
    }

    // 🛡️ 3. SECURITY CHECK NOW (Cache se aane par bhi permission check hogi!)
    // Hum payload ke andar se workspaceId nikal rahe hain
    await PermissionService.ensureBoardPermission(
      userId,
      { workspaceId: responsePayload.data.workspaceId.toString() },
      PERMISSION.BOARD_VIEW,
    );
    
    // 💾 4. Agar data DB se laya tha, toh aage ke liye Redis me set kar do
    if (!isCached) {
      await redisClient.set(cacheKey, responsePayload, { ex: 3600 });
    }
    
    // 5. Final response bhej do
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
    
    const cacheKey = `workspace:${workspaceId}:boards`;
    
    // ⚡ 2. Redis se check karo
    const cachedBoards = await redisClient.get(cacheKey);
    if (cachedBoards) {
      console.log(`🚀 Cache Hit: Workspace ${workspaceId}`);
      return res.status(200).json(cachedBoards); 
    }
    
    console.log(`🐢 Cache Miss: Fetching from DB`);
    // 🐌 3. Agar Redis me nahi hai toh DB se laao
    const boards = await boardService.getBoardsInWorkspace(workspaceId, userId);
    
    // 📦 4. Frontend ka passandida format pack karo
    const responseData = { success: true, data: { items: boards } };
    
    // 💾 5. Agli baar ke liye Redis me save karo (1 Ghante ke liye)
    // 💾 5. REDIS LIE DETECTOR
    console.log(`💾 Redis mein save karne ki koshish kar rahe hain. Key: ${cacheKey}`);
    try {
      const redisResponse = await redisClient.set(cacheKey, responseData, { ex: 3600 });
      console.log(`✅ REDIS STATUS: ${redisResponse}`); // Agar successful hua toh "OK" aayega
    } catch (redisError) {
      console.error(`❌ REDIS ERROR: Data save nahi hua! Wajah:`, redisError);
    }
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
    await redisClient.del(`board:${boardId}`); // Invalidate the cache for this specific board
    await redisClient.del(`workspace:${existingBoard.workspaceId.toString()}:boards`);
    res.json({ success: true, data: updatedBoard });
  },
  
  async getBoards(req: Request, res: Response) {
   const start = performance.now();
    const userId = req.auth!.userId;
    // Nayi Cache Key sabhi boards ke liye
    const cacheKey = `user:${userId}:all_boards`; 

    // ⚡ 1. Redis se check karo
    const cachedBoards = await redisClient.get(cacheKey);
    if (cachedBoards) {
      console.log(`🚀 Cache Hit: All Boards for User ${userId}`);
      console.log(`BOARD SERVICE (Cache): ${Math.round(performance.now() - start)} ms`);
      return res.status(200).json(cachedBoards);
    }

    console.log(`🐢 Cache Miss: Fetching All Boards from DB`);
    
    // 🐌 2. Agar Redis me nahi hai, toh DB se laao
    const boards = await boardService.getBoards(userId);
    const dbDone = performance.now();
    console.log(`✅ BOARD SERVICE: ${Math.round(dbDone - start)} ms`);
    
    // Tera purana format jo perfectly chal raha tha
    const responseData = { success: true, data: { items: boards } };
    
    // 💾 3. Agli baar ke liye Redis me save karo (1 Hour)
    await redisClient.set(cacheKey, responseData, { ex: 3600 });
    
    console.log("BOARD TOTAL", Math.round(performance.now() - start), "ms");
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
await redisClient.del(`board:${boardId}`);

// 👇 YEH NAYI LINE ADD KAR DE (Taaki all_boards bhi refresh ho jaye):
await redisClient.del(`user:${userId}:all_boards`);
    res.json({ success: true, message: "Board deleted successfully" });
  },
};
// src/modules/boards/board.controller.ts
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSIONS } from "../../config/roles";
import { boardService } from "./board.service";

export const boardController = {
  
  // 1. CREATE BOARD (Already good, requires workspaceId from body as it's new)
  async createBoard(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { name, description, visibility, workspaceId } = req.body; 

    if (!workspaceId) {
      throw new AppError("workspaceId is required in the request body", 400, "BAD_REQUEST");
    }

    const hasAccess = await PermissionService.hasPermission(userId, workspaceId, PERMISSIONS.BOARD_CREATE);
    if (!hasAccess) {
      throw new AppError("Aapko is workspace mein naya board create karne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    const board = await boardService.createBoard(req.body, userId);
    res.status(201).json({ success: true, data: board });
  },

  // 2. GET BOARD BY ID (Needs VIEW permission)
  async getBoardById(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };
    
    // Step 1: Pehle board fetch karo taaki workspaceId pata chale
    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    // Step 2: Permission check using DB workspaceId
    const hasAccess = await PermissionService.hasPermission(userId, board.workspaceId.toString(), PERMISSIONS.BOARD_VIEW);
    if (!hasAccess) {
      throw new AppError("Aapko is board ko dekhne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    res.json({ success: true, data: board });
  },

  // 3. GET BOARDS IN WORKSPACE (Needs VIEW permission)
  async getBoardsInWorkspace(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    
    // URL mein workspaceId hai, direct check maro
    const hasAccess = await PermissionService.hasPermission(userId, workspaceId, PERMISSIONS.BOARD_VIEW);
    if (!hasAccess) {
      throw new AppError("Aapko is workspace ke boards dekhne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    const boards = await boardService.getBoardsInWorkspace(workspaceId, userId);
    res.json({ success: true, data: { items: boards } });
  },

  // 4. UPDATE BOARD (Fixed Security Flaw - Needs EDIT permission)
  async updateBoard(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };

    // Step 1: Request body pe trust mat karo, DB se asli workspaceId nikalo
    const existingBoard = await boardService.getBoardById(userId, boardId);
    if (!existingBoard) {
       throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    // Step 2: Asli workspaceId ke sath verify karo
    const hasAccess = await PermissionService.hasPermission(userId, existingBoard.workspaceId.toString(), PERMISSIONS.BOARD_EDIT);
    if (!hasAccess) {
      throw new AppError("Aapko is board ko update karne ki permission nahi hai.", 403, "FORBIDDEN");
    }
    
    const updatedBoard = await boardService.updateBoard(boardId, req.body, userId);
    res.json({ success: true, data: updatedBoard });
  },

  // 5. GET ALL BOARDS FOR USER
  async getBoards(req: Request, res: Response) {
    const userId = req.auth!.userId;
    // 💡 NOTE: Yahan 'hasPermission' nahi lagega! 
    // Kyunki service layer database se sirf wahi boards return karegi jin workspaces ka user already hissa hai. 
    // Yeh "Self Data" query hai.
    const boards = await boardService.getBoards(userId);
    res.json({ success: true, data: { items: boards } });
  },

  // 6. REORDER COLUMNS (Needs EDIT permission)
  async reorderColumns(req: Request, res: Response) {
    const { boardId } = req.params as { boardId: string };
    const { columnIds } = req.body as { columnIds: string[] };
    const userId = req.auth!.userId;

    // Step 1: DB se workspaceId nikalo
    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    // Step 2: Edit permission check karo
    const hasAccess = await PermissionService.hasPermission(userId, board.workspaceId.toString(), PERMISSIONS.BOARD_EDIT);
    if (!hasAccess) {
      throw new AppError("Aapko is board ke columns reorder karne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    await boardService.reorderColumns(boardId, columnIds, userId);
    res.json({ success: true, message: "Column order updated" });
  },
  async deleteBoard(req: Request, res: Response) {
    const { boardId } = req.params as { boardId: string };
    const userId = req.auth!.userId;

    // Step 1: DB se workspaceId nikalo
    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    // Step 2: Edit permission check karo
    const hasAccess = await PermissionService.hasPermission(userId, board.workspaceId.toString(), PERMISSIONS.BOARD_EDIT);
    if (!hasAccess) {
      throw new AppError("Aapko is board ko delete karne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    await boardService.deleteBoard(boardId, userId);
    res.json({ success: true, message: "Board deleted successfully" });
  }
}
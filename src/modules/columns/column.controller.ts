// src/modules/columns/column.controller.ts
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSIONS } from "../../config/roles";
import { columnService } from "./column.service";
import { boardService } from "../boards/board.service"; // 👈 Board verify karne ke liye

export const columnController = {
  
  // 1. CREATE COLUMN
  async createColumn(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { name, boardId, workspaceId } = req.body as { name: string; boardId: string; workspaceId: string };
    
    if (!boardId || !workspaceId) {
      throw new AppError("boardId and workspaceId are required in the request body", 400, "BAD_REQUEST");
    }

    // 🛡️ SECURITY CHECK: Kya yeh Board sach mein is Workspace ka hissa hai?
    // Hacker dusre workspaceId bhej kar kisi aur ke board me column na bana de
    const board = await boardService.getBoardById(userId, boardId);
    if (!board || board.workspaceId.toString() !== workspaceId) {
      throw new AppError("Invalid Board or Workspace combination", 400, "BAD_REQUEST");
    }

    // Permission Check
    const hasAccess = await PermissionService.hasPermission(userId, workspaceId, PERMISSIONS.COLUMN_CREATE); // (Agar tumne roles.ts me COLUMN_CREATE rakha hai, toh wahi use karna)
    // (Agar tumne roles.ts me COLUMN_CREATE rakha hai, toh wahi use karna)
    if (!hasAccess) {
      throw new AppError("Aapko is workspace mein naya column create karne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    const column = await columnService.createColumn(name, boardId, workspaceId, userId);
    res.status(201).json({ success: true, data: column });
  },

  // 2. UPDATE COLUMN
  async updateColumn(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { columnId } = req.params as { columnId: string };
    const { name, archived } = req.body as { name?: string; archived?: boolean; };

    // 🛡️ STEP 1: Pehle asli Column nikalo taaki uski DB wali workspaceId mile
    const column = await columnService.getColumnById(columnId); // Assumed method
    if (!column) {
       throw new AppError("Column not found", 404, "NOT_FOUND");
    }

    // 🛡️ STEP 2: Ab verified workspaceId ke sath access check karo
    const hasAccess = await PermissionService.hasPermission(
      userId, 
      column.workspaceId.toString(), 
      PERMISSIONS.COLUMN_EDIT // Column update karna column edit karne ke barabar hai
    );
    
    if (!hasAccess) {
      throw new AppError("Aapko is column ko update karne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    const updatedColumn = await columnService.updateColumn(columnId, { name, archived }, userId);
    res.json({ success: true, data: updatedColumn });
  },

  // 3. GET COLUMNS BY BOARD ID
  async getColumnsByBoardId(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { boardId } = req.params as { boardId: string };

    // 🛡️ STEP 1: Board fetch karo taaki workspaceId mil sake
    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }

    // 🛡️ STEP 2: Check karo ki user ke paas is workspace ke boards dekhne ka right hai ya nahi
    const hasAccess = await PermissionService.hasPermission(userId, board.workspaceId.toString(), PERMISSIONS.BOARD_VIEW);
    if (!hasAccess) {
      throw new AppError("Aapko is board ke columns dekhne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    const columns = await columnService.getColumnsByBoardId(boardId, userId);
    res.json({ success: true, data: { columns } });
  },

  // 4. REORDER TASKS (Inside a Column)
  async reorderTasks(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { columnId } = req.params as { columnId: string };
    const { taskIds } = req.body as { taskIds: string[] };

    // 🛡️ STEP 1: Database se column fetch karo for workspaceId
    const column = await columnService.getColumnById(columnId);
    if (!column) {
      throw new AppError("Column not found", 404, "NOT_FOUND");
    }

    // 🛡️ STEP 2: Task reordering requires EDIT permissions on the board/tasks
    const hasAccess = await PermissionService.hasPermission(
       userId, 
       column.workspaceId.toString(), 
       PERMISSIONS.TASK_EDIT // Task idhar se udhar karna TASK_EDIT mein aana chahiye
    );
    
    if (!hasAccess) {
      throw new AppError("Aapko tasks reorder karne ki permission nahi hai.", 403, "FORBIDDEN");
    }

    await columnService.reorderTasks(columnId, taskIds, userId);
    res.json({ success: true, message: "Tasks reordered successfully", data: null });
  }
};
import { taskService } from "./task.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";

export const taskController = {
  async createTask(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { columnId, boardId } = req.params as {
      columnId: string;
      boardId: string;
    };
    const { title, description, workspaceId } = req.body as {
      title: string;
      description?: string;
      workspaceId: string;
    };
    const userId = req.auth.userId;
    const newTask = await taskService.createTask(
      title,
      description,
      columnId,
      boardId,
      workspaceId,
      userId,
    );
    res.status(201).json({ success: true, data: newTask });
  },
  async getTasksInBoard(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { boardId } = req.params as { boardId: string };
    const tasks = await taskService.getTasksInBoard(boardId);
    res.json({ success: true, data: { items: tasks } });
  },
  async getTaskById(req: Request, res: Response) {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { taskId } = req.params as { taskId: string };
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }
    res.json({ success: true, data: { task } });
  },
  async updateTask(req: Request, res: Response) {
    if (!req.auth?.userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { taskId } = req.params as { taskId: string };
    const { title, description, isCompleted } = req.body as {
        title?: string;
        description?: string;
      isCompleted?: boolean;
    };
    const updatePayload: {
      title?: string;
      description?: string;
      isCompleted?: boolean;
      completedAt?: Date | null;
    } = {
        title,
        description,
    };

    if (typeof isCompleted === 'boolean') {
      updatePayload.isCompleted = isCompleted;
      updatePayload.completedAt = isCompleted ? new Date() : null;
    }

    const updatedTask = await taskService.updateTask(taskId, updatePayload);
    res.json({ success: true, data: updatedTask });
  },
  async moveTask(req: Request, res: Response) {
    if (!req.auth?.userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { taskId } = req.params as { taskId: string };
    const { sourceColumnId, targetColumnId, targetIndex } = req.body as {
        sourceColumnId: string;
        targetColumnId: string;
        targetIndex: number;
    };
    await taskService.moveTask(taskId, sourceColumnId, targetColumnId, targetIndex);
    res.json({ success: true, message: "Task moved successfully", data: null });
  }
};

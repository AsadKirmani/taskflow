import { taskService } from "./task.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";

const parseCsv = (value: unknown): string[] => {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

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

    const dueType = typeof req.query.dueType === 'string' ? req.query.dueType : 'all';
    const memberScope =
      typeof req.query.memberScope === 'string' ? req.query.memberScope : 'all';
    const completion =
      typeof req.query.completion === 'string' ? req.query.completion : 'all';

    const tasks = await taskService.getTasksInBoard(boardId, {
      search: typeof req.query.search === 'string' ? req.query.search : '',
      priorities: parseCsv(req.query.priorities),
      assigneeIds: parseCsv(req.query.assigneeIds),
      labels: parseCsv(req.query.labels),
      activity: parseCsv(req.query.activity) as Array<
        'recentlyupdated' | 'recentlycreated' | 'activeinlastweek' | 'activeinlastmonth'
      >,
      currentUserId: req.auth.userId,
      memberScope: memberScope === 'no_members' || memberScope === 'me' ? memberScope : 'all',
      completion:
        completion === 'completed' || completion === 'incomplete' ? completion : 'all',
      dueType:
        dueType === 'none' ||
        dueType === 'overdue' ||
        dueType === 'today' ||
        dueType === 'this_week'
          ? dueType
          : 'all'
    });
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
    } = {};

    if (typeof title === 'string') {
      updatePayload.title = title;
    }

    if (typeof description === 'string') {
      updatePayload.description = description;
    }

    if (typeof isCompleted === 'boolean') {
      updatePayload.isCompleted = isCompleted;
      updatePayload.completedAt = isCompleted ? new Date() : null;
    }

    const updatedTask = await taskService.updateTask(taskId, updatePayload, req.auth.userId);
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
    await taskService.moveTask(taskId, sourceColumnId, targetColumnId, targetIndex, req.auth.userId);
    res.json({ success: true, message: "Task moved successfully", data: null });
  }
};

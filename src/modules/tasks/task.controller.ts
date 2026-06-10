import { taskService } from "./task.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSION } from "../../config/roles";
import { boardService } from "../boards/board.service";

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
    const { title, description, workspaceId, columnId, boardId } = req.body as {
      title: string;
      description?: string;
      workspaceId: string;
      columnId: string;
      boardId: string;
    };
    const userId = req.auth!.userId;
    const board = await boardService.getBoardById(userId, boardId);
    if (!board || board.workspaceId.toString() !== workspaceId) {
      throw new AppError("Invalid Board or Workspace combination", 400, "BAD_REQUEST");
    }
    await PermissionService.ensureTaskPermission(
      userId,
      { workspaceId },
      PERMISSION.TASK_CREATE
    );
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
    const { boardId } = req.params as { boardId: string };

    const dueType = typeof req.query.dueType === 'string' ? req.query.dueType : 'all';
    const memberScope =
      typeof req.query.memberScope === 'string' ? req.query.memberScope : 'all';
    const completion =
      typeof req.query.completion === 'string' ? req.query.completion : 'all';
      const userId = req.auth!.userId;
    const board = await boardService.getBoardById(userId, boardId);
    if (!board) {
      throw new AppError("Board not found", 404, "NOT_FOUND");
    }
    const tasks = await taskService.getTasksInBoard(boardId, {
      search: typeof req.query.search === 'string' ? req.query.search : '',
      priorities: parseCsv(req.query.priorities),
      assigneeIds: parseCsv(req.query.assigneeIds),
      labels: parseCsv(req.query.labels),
      activity: parseCsv(req.query.activity) as Array<
        'recentlyupdated' | 'recentlycreated' | 'activeinlastweek' | 'activeinlastmonth'
      >,
      currentUserId: req.auth!.userId,
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
      await PermissionService.ensureTaskPermission(
        userId,
        { workspaceId: board.workspaceId.toString() },
        PERMISSION.TASK_VIEW
      );
    res.json({ success: true, data: { items: tasks } });
  },
  async getTaskById(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { taskId } = req.params as { taskId: string };
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }
    await PermissionService.ensureTaskPermission(
      userId,
      { workspaceId: task.workspaceId.toString() },
      PERMISSION.TASK_VIEW
    );
    res.json({ success: true, data: { task } });
  },
  async updateTask(req: Request, res: Response) {
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
    const userId = req.auth!.userId;
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }
    await PermissionService.ensureTaskPermission(
      userId,
      { workspaceId: task.workspaceId.toString() },
      PERMISSION.TASK_EDIT
    );

    const updatedTask = await taskService.updateTask(taskId, updatePayload, req.auth!.userId);
    res.json({ success: true, data: updatedTask });
  },
  async moveTask(req: Request, res: Response) {
    const { taskId } = req.params as { taskId: string };
    const { sourceColumnId, targetColumnId, targetIndex } = req.body as {
        sourceColumnId: string;
        targetColumnId: string;
        targetIndex: number;
    };
    const userId = req.auth!.userId;
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }
    await PermissionService.ensureTaskPermission(
      userId,
      { workspaceId: task.workspaceId.toString() },
      PERMISSION.TASK_EDIT
    );
    await taskService.moveTask(taskId, sourceColumnId, targetColumnId, targetIndex, userId);
    res.json({ success: true, message: "Task moved successfully", data: null });
  },
  async deleteTask(req: Request, res: Response) {
    const { taskId } = req.params as { taskId: string };
    const userId = req.auth!.userId;
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }
    await PermissionService.ensureTaskPermission(
      userId,
      { workspaceId: task.workspaceId.toString() },
      PERMISSION.TASK_DELETE
    );
    await taskService.deleteTask(taskId, userId);
    res.json({ success: true, message: "Task deleted successfully", data: null });
  }
};

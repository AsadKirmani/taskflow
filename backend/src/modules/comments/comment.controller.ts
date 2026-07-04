import { commentService } from "./comment.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSION } from "../../config/roles";
import { taskService } from "../tasks/task.service";
import { authService } from "../auth/auth.service";

export const commentController = {
  async createComment(req: Request, res: Response) {
    const { taskId } = req.params as { taskId: string };
    const task = await taskService.getTaskById(taskId);
    const authorId = req.auth!.userId;
    const author =
      (await authService.getCurrentUser(authorId)).name || "Unknown User";
    const { content } = req.body as { content: string };
    try {
      await PermissionService.ensure(
        authorId,
        task!.workspaceId.toString(),
        PERMISSION.COMMENT_CREATE,
      );
      const newComment = await commentService.createComment(
        content,
        taskId,
        task!.boardId!.toString(),
        task!.workspaceId!.toString(),
        author,
        authorId,
      );
      res.status(201).json(newComment);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  },
  async getCommentsByTaskId(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { taskId } = req.params as { taskId: string };
    const comments = await commentService.getCommentsByTaskId(userId, taskId);
    res.status(200).json(comments);
  },
  async updateComment(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { commentId } = req.params as { commentId: string };
    const comment = await commentService.getCommentById(commentId);
    const { content, archived } = req.body as {
      content?: string;
      archived?: boolean;
    };
    await PermissionService.ensureCommentPermission(
      userId,
      { workspaceId: comment!.workspaceId.toString() },
      PERMISSION.COMMENT_EDIT,
    );
    await PermissionService.ensureCommentOwnership(userId, {
      authorId: comment!.authorId.toString(),

      workspaceId: comment!.workspaceId.toString(),
    });
    const updatedComment = await commentService.updateComment(
      commentId,
      {
        content,
        archived,
      },
      userId,
    );
    res.json(updatedComment);
  },
  async deleteComment(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { commentId } = req.params as { commentId: string };
    const comment = await commentService.getCommentById(commentId);
    await PermissionService.ensureCommentPermission(
      userId,
      { workspaceId: comment!.workspaceId.toString() },
      PERMISSION.COMMENT_DELETE,
    );
    await PermissionService.ensureCommentOwnership(userId, {
      authorId: comment!.authorId.toString(),

      workspaceId: comment!.workspaceId.toString(),
    });
    await commentService.updateComment(commentId, { archived: true }, userId);
    res.status(204).send();
  },
};

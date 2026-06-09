import { commentService } from "./comment.service";
import { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { PERMISSIONS } from "../../config/roles";

export const commentController = {
  async createComment(req: Request, res: Response) {
    const { taskId, boardId, workspaceId } = req.params as { taskId: string; boardId: string; workspaceId: string };
    const { content } = req.body as { content: string };
    const userId = req.auth!.userId;
    const newComment = await commentService.createComment(
      content,
      taskId,
      boardId,
      workspaceId,
      userId,
    );
    const hasAccess = await PermissionService.hasPermission(userId, workspaceId, PERMISSIONS.COMMENT_CREATE);
    if (!hasAccess) {
      throw new AppError("Aapko is workspace mein naya comment create karne ki permission nahi hai.", 403, "FORBIDDEN");
    }
    res.status(201).json(newComment);
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
        const { content, archived } = req.body as { content?: string; archived?: boolean };
          const hasAccess = await PermissionService.hasPermission(userId, commentId, PERMISSIONS.COMMENT_EDIT);
        if (!hasAccess) {
          throw new AppError("Aapko is comment ko edit karne ki permission nahi hai.", 403, "FORBIDDEN");
        }
        const updatedComment = await commentService.updateComment(commentId, {
            content,
            archived,
        }, userId);
        res.json(updatedComment);
    },
    async deleteComment(req: Request, res: Response) {
        const userId = req.auth!.userId;
        const { commentId } = req.params as { commentId: string };
        const hasAccess = await PermissionService.hasPermission(userId, commentId, PERMISSIONS.COMMENT_DELETE);
        if (!hasAccess) {
          throw new AppError("Aapko is comment ko delete karne ki permission nahi hai.", 403, "FORBIDDEN");
        }
        await commentService.updateComment(commentId, { archived: true }, userId);
        res.status(204).send();
    }
};
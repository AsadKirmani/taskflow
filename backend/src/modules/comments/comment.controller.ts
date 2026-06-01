import { commentService } from "./comment.service";
import e, { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";

export const commentController = {
  async createComment(req: Request, res: Response) {
    if (!req.auth?.userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { taskId, boardId, workspaceId } = req.params as { taskId: string; boardId: string; workspaceId: string };
    const { content } = req.body as { content: string };
    const userId = req.auth.userId;
    const newComment = await commentService.createComment(
      content,
      taskId,
      boardId,
      workspaceId,
      userId,
    );
    res.status(201).json(newComment);
  },
  async getCommentsByTaskId(req: Request, res: Response) {
    if (!req.auth?.userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const { taskId } = req.params as { taskId: string };
    const comments = await commentService.getCommentsByTaskId(taskId);
    res.status(200).json(comments);
    },
    async updateComment(req: Request, res: Response) {
        if (!req.auth?.userId) {
            throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
        }
        const { commentId } = req.params as { commentId: string };
        const { content, archived } = req.body as { content?: string; archived?: boolean };
        const updatedComment = await commentService.updateComment(commentId, {
            content,
            archived,
        });
        res.json(updatedComment);
    },
};
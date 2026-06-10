import { taskRepository } from "../tasks/task.repository";
import { commentRepository } from "./comment.repository";
import { activityService } from "../activity/activity.service";

export const commentService = {
  async createComment(
    content: string,
    taskId: string,
    boardId: string,
    workspaceId: string,
    author: string,
    authorId: string,
  ) {
    const newComment = await commentRepository.createComment({
        content,
        taskId,
        boardId,
        workspaceId,
        author,
        authorId,
    });
    const task = await taskRepository.getTaskById(taskId);
    await taskRepository.updateTask(taskId, { commentCount: (task?.commentCount ?? 0) + 1 });

    await activityService.logActivity({
      workspaceId,
      boardId,
      taskId,
      userId: authorId,
      actionType: 'comment_created',
      entityType: 'comment',
      entityId: newComment._id.toString(),
      metadata: {
        contentPreview: content.slice(0, 120)
      }
    });

    return newComment;
  },
  async getCommentsByTaskId(userId: string, taskId: string) {
    const comments = await commentRepository.getCommentsByTaskId(taskId);
    return comments;
  },
    async updateComment(
    commentId: string,
    data: { content?: string; archived?: boolean },
      userId?: string,
  ) {
      const existingComment = await commentRepository.getCommentById(commentId);
    const updatedComment = await commentRepository.updateComment(commentId, data);

      if (updatedComment && userId) {
        await activityService.logActivity({
          workspaceId: updatedComment.workspaceId.toString(),
          boardId: updatedComment.boardId.toString(),
          taskId: updatedComment.taskId.toString(),
          userId,
          actionType: 'comment_updated',
          entityType: 'comment',
          entityId: commentId,
          metadata: {
            previousContentPreview: existingComment?.content?.slice(0, 120),
            contentPreview: updatedComment.content?.slice(0, 120)
          }
        });
      }

    return updatedComment;
  },
  getCommentById(commentId: string) {
    return commentRepository.getCommentById(commentId);
  },
  async deleteComment(commentId: string, userId: string) {
    const existingComment = await commentRepository.getCommentById(commentId);
    await commentRepository.updateComment(commentId, { archived: true });

    if (existingComment) {
      await activityService.logActivity({
        workspaceId: existingComment.workspaceId.toString(),
        boardId: existingComment.boardId.toString(),
        taskId: existingComment.taskId.toString(),
        userId,
        actionType: 'comment_deleted',
        entityType: 'comment',
        entityId: commentId,
        metadata: {
          previousContentPreview: existingComment.content?.slice(0, 120)
        }
      });
    }
  }
  };
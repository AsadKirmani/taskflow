import { taskRepository } from "../tasks/task.repository";
import { commentRepository } from "./comment.repository";

export const commentService = {
  async createComment(
    content: string,
    taskId: string,
    boardId: string,
    workspaceId: string,
    userId: string,
  ) {
    const newComment = await commentRepository.createComment({
        content,
        taskId,
        boardId,
        workspaceId,
        userId,
    });
    const task = await taskRepository.getTaskById(taskId);
    await taskRepository.updateTask(taskId, { commentCount: (task?.commentCount ?? 0) + 1 });
    return newComment;
  },
  async getCommentsByTaskId(taskId: string) {
    const comments = await commentRepository.getCommentsByTaskId(taskId);
    return comments;
  },
    async updateComment(
    commentId: string,
    data: { content?: string; archived?: boolean },
  ) {
    const updatedComment = await commentRepository.updateComment(commentId, data);
    return updatedComment;
  },
};
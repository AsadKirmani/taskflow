import { CommentModel } from "../../models/comment.model";

export const commentRepository = {
  async createComment(data: {
    content: string;
    taskId: string;
    boardId: string;
    workspaceId: string;
    author: string;
    authorId: string;
  }) {
    const newComment = await CommentModel.create(data);
    return newComment;
  },
    async getCommentsByTaskId(taskId: string) {
    const comments = await CommentModel.find({ taskId }).sort({ createdAt: -1 });
    return comments;
  },
  async updateComment(
    commentId: string,
    data: { content?: string; archived?: boolean },
  ) {
    const updatedComment = await CommentModel.findByIdAndUpdate(commentId, data, { returnDocument: "after" });
    return updatedComment;
  },
  async getCommentById(commentId: string) {
    return CommentModel.findById(commentId);
  },
  async deleteComment(commentId: string) {
    await CommentModel.findByIdAndDelete(commentId);
  }
};
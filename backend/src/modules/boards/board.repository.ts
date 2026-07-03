import { Types } from "mongoose";
import { BoardModel } from "../../models/board.model";
import { WorkspaceModel } from "../../models/workspace.model";
import { ColumnModel } from "../../models/column.model";

export const boardRepository = {
  async createBoard(data: {
    name: string;
    description?: string;
    visibility: "private" | "workspace";
    createdBy: string;
  }) {
    const newboard = await BoardModel.create(data);
    await BoardModel.findByIdAndUpdate(newboard._id, {
      $push: { memberIds: data.createdBy },
    });
    return newboard;
  },

  async getBoardById(boardId: string) {
    return await BoardModel.findById(boardId)
      .populate("memberIds", "name email avatarUrl")
      .populate({
        path: "columnOrder",
        match: { archived: false },
        populate: { path: "taskOrder" },
      })
      .lean() // 🚀 YEH ZAROORI HAI CACHING KE LIYE
      .exec();
  },

  async getBoardsInWorkspace(workspaceId: string, userId: string) {
    const boards = await BoardModel.find({
      archived: { $ne: true },
      workspaceId,
      $or: [
        { visibility: "workspace" },
        { visibility: "private", createdBy: userId },
      ],
    });
    return boards;
  },

  async updateBoard(
    boardId: string,
    data: {
      name?: string;
      description?: string;
      visibility?: "private" | "workspace";
      archived?: boolean;
    },
  ) {
    const updatedBoard = await BoardModel.findByIdAndUpdate(boardId, data, {
      returnDocument: "after",
    });
    return updatedBoard;
  },

  async getBoardsForUser(userId: string) {
    const boards = await BoardModel.find({
      archived: false,
      $or: [{ createdBy: userId }, { memberIds: userId }],
    });
    return boards;
  },
  async reorderColumns(boardId: string, newColumnOrder: string[]) {
    const updatedBoard = await BoardModel.findByIdAndUpdate(
      boardId,
      { $set: { columnOrder: newColumnOrder } },
      { returnDocument: "after" },
    );
    const updates = newColumnOrder.map((columnId, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(columnId) },
        update: { $set: { position: index } },
      },
    }));

    if (updates.length > 0) {
      await ColumnModel.bulkWrite(updates);
    }
    return updatedBoard;
  },
  async deleteBoard(boardId: string) {
    return await BoardModel.findByIdAndDelete(boardId);
  },
};

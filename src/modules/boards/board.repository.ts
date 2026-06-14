import { Types } from 'mongoose';
import { BoardModel } from "../../models/board.model";
import { WorkspaceModel } from "../../models/workspace.model"; 

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
    const board = await BoardModel.findById(boardId);
    return board;
  },

  async getBoardsInWorkspace(workspaceId: string, userId: string) {

    const boards = await BoardModel.find({ 
      workspaceId,
      $or: [
        { visibility: "workspace" },
        { visibility: "private", createdBy: userId }
      ]
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
      new: true,
    });
    return updatedBoard;
  },

  async getBoardsForUser(userId: string) {
    console.time("Get Boards for User");
    const boards = await BoardModel.find({
      $or: [
        { createdBy: userId },
        { memberIds: userId }
      ]
    });
    console.timeEnd("Get Boards for User");
    return boards;
  },
   async reorderColumns(boardId: string, newColumnOrder: string[]) {
    return await BoardModel.findByIdAndUpdate(
      boardId, 
      {$set: { columnOrder: newColumnOrder }}, 
      { new: true });
  },
  async deleteBoard(boardId: string) {
    return await BoardModel.findByIdAndDelete(boardId);
  }
};
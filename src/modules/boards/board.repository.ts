import { BoardModel } from "../../models/board.model";
export const boardRepository = {
  async createBoard(data: {
    name: string;
    description?: string;
    visibility: "private" | "workspace";
    createdBy: string;
    workspaceId: string;
    workSpaceName: string;
    memberIds?: string[];
  }) {
    // Simulate database insert operation
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
  async getBoardsInWorkspace(workspaceId: string) {
    const boards = await BoardModel.find({ workspaceId });
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
    const boards = await BoardModel.find({ createdBy: userId });
    return boards;
  }
};

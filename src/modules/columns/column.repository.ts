import { BoardModel } from "../../models/board.model";
import { ColumnModel } from "../../models/column.model";

export const columnRepository = {
  async createColumn(data: {
    name: string;
    boardId: string;
    workspaceId: string;
    createdBy: string;
    position?: number;
  }) {
    const newColumn = await ColumnModel.create(data);
    await BoardModel.findByIdAndUpdate(data.boardId, {
      $push: { columnOrder: newColumn._id },
    });
    return newColumn;
  },
  async updateColumn(
    columnId: string,
    data: { name?: string; archived?: boolean },
  ) {
    const updatedColumn = await ColumnModel.findByIdAndUpdate(columnId, data, {
      new: true,
    });
    return updatedColumn;
  },
  getColumnById(columnId: string) {
    return ColumnModel.findById(columnId);
  },
  async getColumnsByBoardId(boardId: string) {
    return ColumnModel.find({ boardId }).sort({ position: 1 });
  },
  async reorderTasks(columnId: string, newTaskOrder: string[]) {
    return await ColumnModel.findByIdAndUpdate(
      columnId, 
      {$set: { taskOrder: newTaskOrder }}, 
      { new: true });
  }
};

import { Types } from "mongoose";
import { BoardModel } from "../../models/board.model";
import { ColumnModel } from "../../models/column.model";
import { TaskModel } from "../../models/task.model";

export const columnRepository = {
  async createColumn(data: {
    name: string;
    boardId: string;
    workspaceId: string;
    createdBy: string;
    position?: number;
  }) {
    if (data.position === undefined) {
      const board = await BoardModel.findById(data.boardId).select(
        "columnOrder",
      );
      data.position = board?.columnOrder?.length || 0;
    }
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
      returnDocument: "after",
    });
    return updatedColumn;
  },
  getColumnById(columnId: string) {
    return ColumnModel.findById(columnId);
  },
  async getColumnsByBoardId(boardId: string) {
    return ColumnModel.find({ boardId, archived: false })
      .select("_id name boardId position taskOrder")
      .sort({ position: 1 })
      .lean();
  },
  async reorderTasks(columnId: string, newTaskOrder: string[]) {
    const updatedColumn = await ColumnModel.findByIdAndUpdate(
      columnId,
      { $set: { taskOrder: newTaskOrder } },
      { returnDocument: "after" },
    );
    const updates = newTaskOrder.map((taskId, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(taskId) },
        update: { $set: { position: index } },
      },
    }));
    if (updates.length > 0) {
      await TaskModel.bulkWrite(updates);
    }
    return updatedColumn;
  },
};

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
  async getColumnsByBoardId(boardId: string) {
    return ColumnModel.find({ boardId }).sort({ position: 1 });
  },
  async reorderColumns(columnIds: string[]) {
    await Promise.all(
      columnIds.map((id, index) =>
        ColumnModel.findByIdAndUpdate(id, { position: index })
      )
    );
  }
};

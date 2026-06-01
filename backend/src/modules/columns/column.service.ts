import { columnRepository } from "./column.repository";

export const columnService = {
  async createColumn(
    name: string,
    boardId: string,
    workspaceId: string,
    userId: string,
  ) {
    const column = await columnRepository.createColumn({
      name,
      boardId,
      workspaceId,
      createdBy: userId,
    });
    return column;
  },
    async updateColumn(
    columnId: string,
    data: { name?: string; archived?: boolean },
  ) {
    const updatedColumn = await columnRepository.updateColumn(columnId, data);
    return updatedColumn;
  },
  async getColumnsByBoardId(boardId: string) {
    return columnRepository.getColumnsByBoardId(boardId);
  },
  async reorderColumns(columnIds: string[]) {
    return columnRepository.reorderColumns(columnIds);
  }
};

import { columnRepository } from "./column.repository";
import { activityService } from "../activity/activity.service";

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

    await activityService.logActivity({
      workspaceId,
      boardId,
      columnId: column._id.toString(),
      userId,
      actionType: "column_created",
      entityType: "column",
      entityId: column._id.toString(),
      metadata: { name: column.name },
    });

    return column;
  },
  async updateColumn(
    columnId: string,
    data: { name?: string; archived?: boolean },
    userId?: string,
  ) {
    const updatedColumn = await columnRepository.updateColumn(columnId, data);

    if (updatedColumn && userId) {
      await activityService.logActivity({
        workspaceId: updatedColumn.workspaceId.toString(),
        boardId: updatedColumn.boardId.toString(),
        columnId,
        userId,
        actionType:
          data.archived === true ? "column_archived" : "column_updated",
        entityType: "column",
        entityId: columnId,
        metadata: {
          updatedFields: Object.keys(data),
        },
      });
    }

    return updatedColumn;
  },
  async getColumnById(columnId: string) {
    return columnRepository.getColumnById(columnId);
  },
  async getColumnsByBoardId(boardId: string, userId: string) {
    return columnRepository.getColumnsByBoardId(boardId);
  },
  async reorderTasks(columnId: string, taskIds: string[], userId: string) {
    return await columnRepository.reorderTasks(columnId, taskIds);
  },
};

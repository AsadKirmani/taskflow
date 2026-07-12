import { archiveRepository } from "./archive.repository";
import { activityService } from "../activity/activity.service";

export const archiveService = {
  async archiveEntity(data: {
    workspaceId: string;
    entityType: "board" | "column" | "task";
    entityId: string;
    userId: string;
    reason?: string;
  }) {
    const result = await archiveRepository.archiveEntity(data);

    if (result) {
      await activityService.logActivity({
        workspaceId: data.workspaceId,
        boardId:
          data.entityType === "board"
            ? data.entityId
            : result.updated.boardId?.toString(),
        columnId:
          data.entityType === "column"
            ? data.entityId
            : result.updated.columnId?.toString(),
        taskId: data.entityType === "task" ? data.entityId : undefined,
        userId: data.userId,
        actionType: `${data.entityType}_archived`,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: {
          reason: data.reason ?? "",
        },
      });
    }

    return result;
  },

  async restoreEntity(data: {
    workspaceId: string;
    entityType: "board" | "column" | "task";
    entityId: string;
    userId: string;
  }) {
    const result = await archiveRepository.restoreEntity(data);

    if (result) {
      await activityService.logActivity({
        workspaceId: data.workspaceId,
        boardId:
          data.entityType === "board"
            ? data.entityId
            : result.boardId?.toString(),
        columnId:
          data.entityType === "column"
            ? data.entityId
            : result.columnId?.toString(),
        taskId: data.entityType === "task" ? data.entityId : undefined,
        userId: data.userId,
        actionType: `${data.entityType}_restored`,
        entityType: data.entityType,
        entityId: data.entityId,
      });
    }

    return result;
  },

  async listArchived(
    workspaceId: string,
    options?: {
      entityType?: "board" | "column" | "task";
      includeRestored?: boolean;
    },
  ) {
    return archiveRepository.listArchived(workspaceId, options);
  },
  async archivedItemsInBoard(boardId: string) {
    return archiveRepository.archivedItemsInBoard(boardId);
  },
};

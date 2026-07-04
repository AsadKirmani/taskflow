import { Model } from "mongoose";
import { BoardModel } from "../../models/board.model";
import { ColumnModel } from "../../models/column.model";
import { TaskModel } from "../../models/task.model";
import { ArchiveModel } from "../../models/archive.model";

const getEntityModel = (
  entityType: "board" | "column" | "task",
): Model<any> => {
  if (entityType === "board") return BoardModel;
  if (entityType === "column") return ColumnModel;
  return TaskModel;
};

export const archiveRepository = {
  async archiveEntity(data: {
    workspaceId: string;
    entityType: "board" | "column" | "task";
    entityId: string;
    userId: string;
    reason?: string;
  }) {
    const model = getEntityModel(data.entityType);

    const updated = await model.findOneAndUpdate(
      { _id: data.entityId, archived: { $ne: true } },
      { archived: true },
      { returnDocument: "after", timestamps: false },
    );

    if (!updated) {
      return null;
    }

    const name = updated.name || updated.title || "Unnamed Entity";

    const archiveRecord = await ArchiveModel.create({
      workspaceId: data.workspaceId,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: name,
      archivedBy: data.userId,
      reason: data.reason ?? "",
    });

    return { updated, archiveRecord };
  },

  async restoreEntity(data: {
    workspaceId: string;
    entityType: "board" | "column" | "task";
    entityId: string;
    userId: string;
  }) {
    const model = getEntityModel(data.entityType);

    const updated = await model.findOneAndUpdate(
      { _id: data.entityId, archived: true },
      { archived: false },
      { returnDocument: "after", timestamps: false },
    );

    if (!updated) {
      return null;
    }

    await ArchiveModel.findOneAndUpdate(
      {
        workspaceId: data.workspaceId,
        entityType: data.entityType,
        entityId: data.entityId,
        restoredAt: null,
      },
      {
        restoredAt: new Date(),
        restoredBy: data.userId,
      },
      { sort: { createdAt: -1 } },
    );

    return updated;
  },

  async listArchived(
    workspaceId: string,
    options?: {
      entityType?: "board" | "column" | "task";
      includeRestored?: boolean;
    },
  ) {
    const query: Record<string, unknown> = {
      workspaceId,
    };

    if (options?.entityType) {
      query["entityType"] = options.entityType;
    }

    if (!options?.includeRestored) {
      query["restoredAt"] = null;
    }

    return ArchiveModel.find(query).sort({ createdAt: -1 });
  },
};

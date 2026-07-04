import { Schema, model, InferSchemaType } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      default: null,
      index: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      default: null,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ["workspace", "board", "column", "task", "comment"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

ActivityLogSchema.index({ workspaceId: 1, createdAt: -1 });

export type ActivityLogDocument = InferSchemaType<typeof ActivityLogSchema>;
export const ActivityLogModel = model("ActivityLog", ActivityLogSchema);

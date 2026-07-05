import { Schema, model, InferSchemaType } from "mongoose";
import { TASK_PRIORITIES } from "../shared/constants/enums";

const TaskLabelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const TaskChecklistItemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const TaskAttachmentSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const TaskSchema = new Schema(
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
      required: true,
      index: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
    },
    assigneeIds: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "medium",
      index: true,
    },
    labels: {
      type: [TaskLabelSchema],
      default: [],
    },
    checklist: {
      type: [TaskChecklistItemSchema],
      default: [],
    },
    coverImageUrl: {
      type: String,
      default: null,
    },
    attachments: {
      type: [TaskAttachmentSchema],
      default: [],
    },
    attachmentCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TaskSchema.index({ title: "text", description: "text" });
TaskSchema.index({ boardId: 1, columnId: 1 });
TaskSchema.index({ assigneeIds: 1 });

export type TaskDocument = InferSchemaType<typeof TaskSchema>;
export const TaskModel = model("Task", TaskSchema);

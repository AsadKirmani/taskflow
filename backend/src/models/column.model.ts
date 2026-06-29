import { Schema, model, InferSchemaType } from 'mongoose';

const ColumnSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    position: {
      type: Number,
      required: true,
      default: 0,
      index: true,
      auto: true
    },
    taskOrder: {
      type: [Schema.Types.ObjectId],
      ref: 'Task',
      default: []
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ColumnSchema.index({ boardId: 1, position: 1 });

export type ColumnDocument = InferSchemaType<typeof ColumnSchema>;
export const ColumnModel = model('Column', ColumnSchema);
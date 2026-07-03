import { Schema, model, InferSchemaType } from 'mongoose';

const ArchiveSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: ['board', 'column', 'task'],
      required: true,
      index: true
    },
    entityName: {
      type: String,
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    restoredAt: {
      type: Date,
      default: null,
      index: true
    },
    restoredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

ArchiveSchema.index({ workspaceId: 1, createdAt: -1 });
ArchiveSchema.index({ entityType: 1, entityId: 1, restoredAt: 1 });

export type ArchiveDocument = InferSchemaType<typeof ArchiveSchema>;
export const ArchiveModel = model('Archive', ArchiveSchema);

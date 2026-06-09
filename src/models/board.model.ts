import { Schema, model, InferSchemaType } from 'mongoose';
import { BOARD_VISIBILITY } from '../shared/constants/enums';

const BoardSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    workSpaceName: {
      type: String,
      required: false,
      trim: true,
      maxlength: 120
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: ''
    },
    visibility: {
      type: String,
      enum: BOARD_VISIBILITY,
      default: 'workspace'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    memberIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    columnOrder: {
      type: [Schema.Types.ObjectId],
      ref: 'Column',
      default: []
    },
    archived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

BoardSchema.index({ workspaceId: 1, archived: 1 });

export type BoardDocument = InferSchemaType<typeof BoardSchema>;
export const BoardModel = model('Board', BoardSchema);
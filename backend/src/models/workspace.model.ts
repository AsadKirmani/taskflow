import { Schema, model, InferSchemaType, Types } from 'mongoose';
import { BOARD_VISIBILITY, WORKSPACE_ROLES } from '../shared/constants/enums';

const WorkspaceMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: WORKSPACE_ROLES,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'invited'],
      default: 'active'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    _id: false
  }
);

const WorkspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    members: {
      type: [WorkspaceMemberSchema],
      default: () => []
    },
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: false
      },
      allowBoardCreationByMembers: {
        type: Boolean,
        default: false
      },
      defaultBoardVisibility: {
        type: String,
        enum: BOARD_VISIBILITY,
        default: 'workspace'
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

WorkspaceSchema.index({ 'members.userId': 1 });

export type WorkspaceDocument = InferSchemaType<typeof WorkspaceSchema> & {
  _id: Types.ObjectId;
};

export const WorkspaceModel = model('Workspace', WorkspaceSchema);
import mongoose, { Schema, model } from 'mongoose';
import { WORKSPACE_ROLES } from '../shared/constants/enums';

const workspaceMemberSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true 
  },
  workspaceName: {
    type: String,
    required: false
    },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: WORKSPACE_ROLES,
    default: 'MEMBER'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  joinedAt: {
      type: Date,
      default: Date.now
    },
}, { timestamps: true });

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const WorkspaceMemberModel = model('WorkspaceMember', workspaceMemberSchema);
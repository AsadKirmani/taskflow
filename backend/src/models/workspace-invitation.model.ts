import { Schema, model, InferSchemaType } from "mongoose";
import { INVITATION_STATUS, WORKSPACE_ROLES } from "../shared/constants/enums";

const WorkspaceInvitationSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: WORKSPACE_ROLES,
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: false,
      select: false,
    },
    status: {
      type: String,
      enum: INVITATION_STATUS,
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: false,
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type WorkspaceInvitationDocument = InferSchemaType<
  typeof WorkspaceInvitationSchema
>;
export const WorkspaceInvitationModel = model(
  "WorkspaceInvitation",
  WorkspaceInvitationSchema,
);

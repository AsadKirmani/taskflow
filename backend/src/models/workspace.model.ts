import { Schema, model, InferSchemaType, Types } from "mongoose";
import { BOARD_VISIBILITY } from "../shared/constants/enums";

const WorkspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
      allowBoardCreationByMembers: {
        type: Boolean,
        default: false,
      },
      defaultBoardVisibility: {
        type: String,
        enum: BOARD_VISIBILITY,
        default: "workspace",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type WorkspaceDocument = InferSchemaType<typeof WorkspaceSchema> & {
  _id: Types.ObjectId;
};

export const WorkspaceModel = model("Workspace", WorkspaceSchema);

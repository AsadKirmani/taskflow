import { Schema, model, InferSchemaType } from "mongoose";
import { THEMES } from "../shared/constants/enums";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    preferences: {
      theme: {
        type: String,
        enum: THEMES,
        default: "system",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      locale: {
        type: String,
        default: "en",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type UserDocument = InferSchemaType<typeof UserSchema>;
export const UserModel = model("User", UserSchema);

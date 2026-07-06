import { WorkspaceInvitationModel } from "../../models/workspace-invitation.model";
import { WorkspaceModel } from "../../models/workspace.model";
import { WorkspaceMemberModel } from "../../models/workspace-member.model";
import { Types } from "mongoose";
import type {
  WorkspaceRole,
  InvitationStatus,
} from "../../shared/constants/enums";

export const workspaceRepository = {
  async createWorkspace(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
  }) {
    const newWorkspace = await WorkspaceModel.create(data);
    await WorkspaceMemberModel.create({
      workspaceId: newWorkspace._id,
      userId: data.ownerId,
      workspaceName: newWorkspace.name,
      role: "OWNER",
    });
    return newWorkspace;
  },
  async getWorkspaceBySlug(slug: string) {
    return WorkspaceModel.findOne({ slug }).select("-__v").lean();
  },
  async getWorkspaceById(workspaceId: string) {
    return WorkspaceModel.findById(workspaceId).select("-__v").lean();
  },
  async getMemberRole(
    workspaceId: string,
    userId: string,
  ): Promise<string | null> {
    const workspace = await WorkspaceModel.findById(workspaceId)
      .select("ownerId")
      .lean();
    if (!workspace) return null;

    if (workspace.ownerId.toString() === userId.toString()) return "OWNER";

    const member = await WorkspaceMemberModel.findOne({ workspaceId, userId })
      .select("role")
      .lean();
    return member ? member.role : null;
  },
  async listUserWorkspaces(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const memberships = await WorkspaceMemberModel.find({ userId: userObjectId }).select("workspaceId").lean();
    const memberWorkspaceIds = memberships.map((m) => m.workspaceId);

    return WorkspaceModel.find({
      $or: [{ ownerId: userObjectId }, { _id: { $in: memberWorkspaceIds } }],
    })
    .select("_id name slug description ownerId createdAt")
    .lean();
  },
  async updateWorkspace(
    workspaceId: string,
    data: Partial<{ name: string; description?: string; settings?: Object }>,
  ) {
    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      data,
      { returnDocument: "after" },
    );
    return updatedWorkspace;
  },
  async workspaceInvitation(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
    invitedBy: string,
    status: InvitationStatus = "pending",
    tokenHash: string,
    expiresAt: Date,
  ) {
    const workspace = await WorkspaceInvitationModel.create({
      workspaceId,
      email,
      role,
      invitedBy,
      status,
      tokenHash,
      expiresAt,
    });
    return workspace;
  },
  async getValidInvitationByHash(tokenHash: string) {
    return WorkspaceInvitationModel.findOne({
      tokenHash,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
  },
  async markInvitationAsAccepted(invitationId: string) {
    return WorkspaceInvitationModel.findByIdAndUpdate(invitationId, {
      status: "accepted",
      acceptedAt: new Date(),
      $unset: { tokenHash: 1 },
    });
  },
  async addMemberToWorkspace(
    workspaceId: string,
    {
      userId,
      role,
      workspaceName,
    }: {
      userId: string;
      role: WorkspaceRole;
      workspaceName: string;
    },
  ) {
    const existingMember = await WorkspaceMemberModel.findOne({
      workspaceId,
      userId,
    });

    if (existingMember) {
      return existingMember;
    }

    const newMember = await WorkspaceMemberModel.create({
      workspaceId,
      userId,
      role,
      workspaceName,
    });

    return newMember;
  },
  async updateMemberRole(workspaceId: string, userId: string, newRole: string) {
    const updatedMember = await WorkspaceMemberModel.findOneAndUpdate(
      { workspaceId, userId },
      { role: newRole },
      { returnDocument: "after" },
    );
    return updatedMember;
  },
  async removeMemberFromWorkspace(workspaceId: string, userId: string) {
    await WorkspaceMemberModel.findOneAndDelete({ workspaceId, userId });
  },
  async deleteWorkspace(workspaceId: string) {
    return WorkspaceModel.findByIdAndDelete(workspaceId);
  },
  async listWorkspaceMembers(workspaceId: string) {
    return WorkspaceMemberModel.find({ workspaceId })
      .select("userId role workspaceName createdAt")
      .lean();
  },
};

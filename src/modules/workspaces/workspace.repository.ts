import { WorkspaceInvitationModel } from '../../models/workspace-invitation.model';
import { WorkspaceModel } from '../../models/workspace.model';
import { Types } from 'mongoose';

export const workspaceRepository = {
  async createWorkspace(data: { name: string; slug: string; description?: string; ownerId: string }) {
    const newWorkspace = await WorkspaceModel.create(data);
    return newWorkspace;
  },
  async getWorkspaceBySlug(slug: string) {
    const workspace = await WorkspaceModel.findOne({ slug });
    return workspace;
  },
  async getWorkspaceById(workspaceId: string) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    return workspace;
  },
  async listUserWorkspaces(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return WorkspaceModel.find({
      $or: [{ ownerId: userObjectId }, { 'members.userId': userObjectId }]
    }).lean();
  },
  async updateWorkspace(workspaceId: string, data: Partial<{ name: string; description?: string, settings?: Object }>) {
    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(workspaceId, data, { new: true });
    return updatedWorkspace; 
},
async workspaceInvitation(workspaceId: string, email: string, role: string, invitedBy: string, status: string = 'pending', tokenHash: string, expiresAt: Date) {
    const workspace = await WorkspaceInvitationModel.create({ workspaceId, email, role, invitedBy, status, tokenHash, expiresAt });
    return workspace;
},
  async getValidInvitationByHash(tokenHash: string) {
    return WorkspaceInvitationModel.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });
  },
  async markInvitationAsAccepted(invitationId: string) {
    return WorkspaceInvitationModel.findByIdAndUpdate(invitationId, {
      status: 'accepted',
      acceptedAt: new Date(),
      $unset: { tokenHash: 1 }
    });
  },

  async addMemberToWorkspace(workspaceId: string, memberData: any) {
    return WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      { $push: { members: memberData } },
      { new: true }
    );
  }
};
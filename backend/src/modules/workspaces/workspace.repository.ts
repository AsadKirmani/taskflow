import { WorkspaceInvitationModel } from '../../models/workspace-invitation.model';
import { WorkspaceModel } from '../../models/workspace.model';

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
    return WorkspaceModel.find({
      $or: [{ ownerId: userId }, { 'members.userId': userId }]
    }).lean();
  },
  async updateWorkspace(workspaceId: string, data: Partial<{ name: string; description?: string, settings?: Object }>) {
    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(workspaceId, data, { new: true });
    return updatedWorkspace; 
},
async workspaceInvitation(workspaceId: string, email: string, role: string, invitedBy: string, status: string = 'pending', tokenHash: string, expiresAt: Date) {
    // Placeholder for workspace invitation logic
    // This would typically involve creating an invitation record and sending an email
    const workspace = await WorkspaceInvitationModel.create({ workspaceId, email, role, invitedBy, status, tokenHash, expiresAt });
    return workspace;
}
};

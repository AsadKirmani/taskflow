import { CreateWorkspaceDto, UpdateWorkspaceDto, } from './workspace.dto';
import { workspaceRepository, } from './workspace.repository';
import { sendInvitationEmail } from '../../config/mailer';
import { authService } from '../auth/auth.service';
import { AppError } from '../../shared/errors/app-error';

const createSlug = (value: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'workspace';
};

export const workspaceService = {
  async listUserWorkspaces(userId: string) {
    const workspaces = await workspaceRepository.listUserWorkspaces(userId);

    return workspaces.map(workspace => {
      const ownerId = workspace.ownerId?.toString();
      const member = workspace.members?.find(memberItem => memberItem.userId?.toString() === userId);
      const currentUserRole = ownerId === userId ? 'admin' : member?.role ?? 'member';

      return {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description ?? '',
        memberCount: workspace.members?.length ?? 0,
        currentUserRole
      };
    });
  },
  async createWorkspace(input: CreateWorkspaceDto, userId: string) {
    const baseSlug = createSlug(input.name);
    let slug = baseSlug;
    let suffix = 1;

    while (await workspaceRepository.getWorkspaceBySlug(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const workspace = await workspaceRepository.createWorkspace({
      ...input,
      slug,
      ownerId: userId
    });
    return workspace;
  },
  async getWorkspaceDetail(workspaceId: string, userId: string) {
    const workspace = await workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
    }
    return workspace;
},
async updateWorkSpace(workspaceId: string, data: Partial<UpdateWorkspaceDto>, userId: string) {
    const workspace = await workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
    }
    if (workspace.ownerId.toString() !== userId) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }
    const updatedWorkspace = await workspaceRepository.updateWorkspace(workspaceId, data);
    // Update logic here (e.g., update name, description)
    // For simplicity, we will just return the existing workspace
    return updatedWorkspace;
  },
  async inviteWorkspaceMember(workspaceId: string, email: string, userId: string, role: string, tokenHash: string, expiresAt: Date, status: string = 'pending') {
    const inviteeName = await authService.getCurrentUser(userId);
    const inviteeId = userId ;
    // Placeholder for inviting a member to the workspace
    // This would typically involve creating an invitation record and sending an email
    const workspace = await workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
    }
    await workspaceRepository.workspaceInvitation(workspaceId, email, role, inviteeId, status, tokenHash, expiresAt);
    await sendInvitationEmail(email, workspace.name, inviteeName.name, role);
    return { success: true, message: `Invitation sent to ${email} from ${inviteeName.name}` };
  },
  async updateWorkspaceMemberRole(workspaceId: string, memberId: string, newRole: string, userId: string) {
    // Placeholder for updating a member's role in the workspace
    // This would typically involve checking permissions and updating the member's role in the database
    return { success: true, message: `Member ${memberId} role updated to ${newRole}` };
  }
};

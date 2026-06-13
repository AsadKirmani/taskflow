import { CreateWorkspaceDto, UpdateWorkspaceDto, } from './workspace.dto';
import { workspaceRepository, } from './workspace.repository';
import { sendInvitationEmail } from '../../config/mailer';
import { authService } from '../auth/auth.service';
import { AppError } from '../../shared/errors/app-error';
import { activityService } from '../activity/activity.service';
import crypto from 'crypto';
import { PermissionService } from '../../services/permission.service';
import { WorkspaceMemberModel } from '../../models/workspace-member.model';
import { PERMISSION } from '../../config/roles';

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
    return workspaces;
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

    await activityService.logActivity({
      workspaceId: workspace._id.toString(),
      userId,
      actionType: 'workspace_created',
      entityType: 'workspace',
      entityId: workspace._id.toString(),
      metadata: {
        name: workspace.name,
        slug: workspace.slug
      }
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
    if (updatedWorkspace) {
      await activityService.logActivity({
        workspaceId,
        userId,
        actionType: 'workspace_updated',
        entityType: 'workspace',
        entityId: workspaceId,
        metadata: {
          updatedFields: Object.keys(data)
        }
      });
    }
    return updatedWorkspace;
  },
  async inviteWorkspaceMember(workspaceId: string, email: string, userId: string, role: string) {
    const inviter = await authService.getCurrentUser(userId);
    const workspace = await workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    const status = 'pending';

    await workspaceRepository.workspaceInvitation(
        workspaceId, 
        email, 
        role, 
        userId,
        status, 
        tokenHash, 
        expiresAt
    );

    await sendInvitationEmail(email, workspace.name, inviter.name, role, rawToken);
    await activityService.logActivity({
      workspaceId,
      userId,
      actionType: 'workspace_member_invited',
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: {
        email,
        role,
        status
      }
    });

    return { success: true, message: `Invitation sent to ${email} from ${inviter.name}` };
  },

  async updateWorkspaceMemberRole(workspaceId: string, memberId: string, newRole: string, userId: string) {
    const updatedMember = await workspaceRepository.updateMemberRole(workspaceId, memberId, newRole);
    if (updatedMember) {
      await activityService.logActivity({
        workspaceId,
        userId,
        actionType: 'workspace_member_role_updated',
        entityType: 'workspace',
        entityId: workspaceId,
        metadata: { memberId, newRole }
      });
    }
    return { success: true, message: `Member ${memberId} role updated to ${newRole}` };
  },

  async acceptWorkspaceInvitation(token: string, userId: string) {
    if (!token) {
      throw new AppError('Invitation token is required', 400, 'BAD_REQUEST');
    }

    const cleanToken = token.trim();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await workspaceRepository.getValidInvitationByHash(tokenHash);
    if (!invitation) {
      throw new AppError('Invalid or expired invitation link', 400, 'INVALID_INVITE');
    }
   
    const workspaceId = invitation.workspaceId.toString();
    const workspace = await workspaceRepository.getWorkspaceById(workspaceId);
    
    if (!workspace) {
      throw new AppError('Workspace no longer exists', 404, 'NOT_FOUND');
    }

    const isAlreadyMember = await WorkspaceMemberModel.exists({ workspaceId, userId, status: 'active' });

    if (isAlreadyMember) {
      throw new AppError('You are already a member of this workspace', 400, 'ALREADY_MEMBER');
    }

    await workspaceRepository.addMemberToWorkspace(workspaceId, {
      userId,
      role: invitation.role,
      status: 'accepted',
      invitedBy: invitation.invitedBy,
      joinedAt: new Date()
    });

    await workspaceRepository.markInvitationAsAccepted(invitation._id.toString());

    await activityService.logActivity({
      workspaceId,
      userId,
      actionType: 'workspace_member_joined',
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: { role: invitation.role }
    });

    return { 
      success: true, 
      message: 'Successfully joined the workspace',
      workspaceId 
    };
  },
  async removeWorkspaceMember(workspaceId: string, memberId: string, userId: string) {
    const workspace = await workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
    }
    const member = await WorkspaceMemberModel.findOne({ workspaceId, userId: memberId });
    if (!member) {
      throw new AppError('Member not found in workspace', 404, 'MEMBER_NOT_FOUND');
    }
    await workspaceRepository.removeMemberFromWorkspace(workspaceId, memberId);
    await activityService.logActivity({
      workspaceId,
      userId,
      actionType: 'workspace_member_removed',
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: { memberId }
    });
  },
  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await workspaceRepository.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
    }
    await workspaceRepository.deleteWorkspace(workspaceId);
    await activityService.logActivity({
      workspaceId,
      userId,
      actionType: 'workspace_deleted',
      entityType: 'workspace',
      entityId: workspaceId,
      metadata: {}
    });
    return { success: true, message: 'Workspace deleted successfully' };
  }
};

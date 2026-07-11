import { Request, Response } from "express";
import { workspaceService } from "./workspace.service";
import { AppError } from "../../shared/errors/app-error";
import { PermissionService } from "../../services/permission.service";
import { WorkspaceRole } from "../../shared/constants/enums";
import { redisClient } from "../../config/redis";

export const workspaceController = {
  async listWorkspaces(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const cacheKey = `user:${userId}:workspaces`;
    const cachedWorkspaces = await redisClient.get(cacheKey) as string | null;
    if (cachedWorkspaces) {
      return res.json({ success: true, data: JSON.parse(cachedWorkspaces) });
    }
    const workspaces = await workspaceService.listUserWorkspaces(userId);
    await redisClient.set(cacheKey, JSON.stringify(workspaces), { ex: 3600 });
    res.json({
      success: true,
      data: workspaces,
    });
  },

  async createWorkspace(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const workspace = await workspaceService.createWorkspace(req.body, userId);
    await redisClient.del(`user:${userId}:profile`);
    res.status(201).json({ success: true, data: workspace });
  },

  async getWorkspaceDetail(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    const cacheKey = `workspace:${workspaceId}:detail`;
    const cachedWorkspaceDetail = await redisClient.get(cacheKey);
    if (cachedWorkspaceDetail) {
      return res.json({ success: true, data: cachedWorkspaceDetail });
    }
    const workspaceDetail = await workspaceService.getWorkspaceDetail(
      workspaceId,
      userId,
    );
    await redisClient.set(cacheKey, JSON.stringify(workspaceDetail), {
      ex: 3600,
    });
    res.json({ success: true, data: workspaceDetail });
  },

  async updateWorkSpace(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    await PermissionService.ensure(userId, workspaceId, "workspace:edit");
    const updatedWorkspace = await workspaceService.updateWorkSpace(
      workspaceId,
      req.body,
      userId,
    );
    await redisClient.del(`workspace:${workspaceId}:detail`);
    await redisClient.del(`user:${userId}:workspaces`);
    res.json({ success: true, data: updatedWorkspace });
  },

  async inviteWorkspaceMember(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    const { email, role } = req.body as {
      email: string;
      role: WorkspaceRole;
    };
    await PermissionService.ensure(userId, workspaceId, "member:invite");
    await PermissionService.ensureCanInviteRole(
      userId,
      workspaceId,
      role as WorkspaceRole,
    );
    const result = await workspaceService.inviteWorkspaceMember(
      workspaceId,
      email,
      userId,
      role,
    );

    res.status(201).json(result);
  },

  async acceptWorkspaceInvite(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { token } = req.body as { token: string };
    const result = await workspaceService.acceptWorkspaceInvitation(
      token,
      userId,
    );
    await redisClient.del(`user:${userId}:workspaces`);
    res.status(200).json(result);
  },
  async updateWorkspaceMemberRole(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId, memberId } = req.params as {
      workspaceId: string;
      memberId: string;
    };
    const { newRole } = req.body as { newRole: WorkspaceRole };
    await PermissionService.ensure(userId, workspaceId, "member:role_change");
    await PermissionService.ensureCanChangeRole(
      userId,
      workspaceId,
      newRole as WorkspaceRole,
    );
    const updatedMember = await workspaceService.updateWorkspaceMemberRole(
      workspaceId,
      memberId,
      newRole,
      userId,
    );
    await redisClient.del(`workspace:${workspaceId}:detail`);
    await redisClient.del(`workspace:${workspaceId}:members`);
    await redisClient.del(`user:${memberId}:workspaces`);
    res.json({ success: true, data: updatedMember });
  },
  async removeWorkspaceMember(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId, memberId } = req.params as {
      workspaceId: string;
      memberId: string;
    };
    await PermissionService.ensure(userId, workspaceId, "member:remove");
    await PermissionService.ensureCanManageMember(
      userId,
      memberId,
      workspaceId,
    );
    await workspaceService.removeWorkspaceMember(workspaceId, memberId, userId);
    await redisClient.del(`workspace:${workspaceId}:detail`);
    await redisClient.del(`workspace:${workspaceId}:members`);
    await redisClient.del(`user:${memberId}:workspaces`);
    res.json({ success: true, message: "Member removed successfully" });
  },
  async deleteWorkspace(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    await PermissionService.ensure(userId, workspaceId, "workspace:delete");
    const result = await workspaceService.deleteWorkspace(workspaceId, userId);
    await redisClient.del(`workspace:${workspaceId}:detail`);
    await redisClient.del(`user:${userId}:workspaces`);
    await redisClient.del(`workspace:${workspaceId}:members`);
    res.json(result);
  },
  async listWorkspaceMembers(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const { workspaceId } = req.params as { workspaceId: string };
    const cacheKey = `workspace:${workspaceId}:members`;
    const cachedMembers = await redisClient.get(cacheKey);
    if (cachedMembers) {
      return res.json({ success: true, data: { items: cachedMembers } });
    }
    await PermissionService.ensure(userId, workspaceId, "workspace:view");
    const members = await workspaceService.listWorkspaceMembers(
      workspaceId,
      userId,
    );
    await redisClient.set(cacheKey, JSON.stringify(members), { ex: 3600 });
    res.json({ success: true, data: members });
  },
};

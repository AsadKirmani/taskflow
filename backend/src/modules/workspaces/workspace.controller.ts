import { Request, Response } from 'express';
import { workspaceService } from './workspace.service';
import { AppError } from '../../shared/errors/app-error';

export const workspaceController = {
    async listWorkspaces(req: Request, res: Response) {
        if (!req.auth?.userId) {
            throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const workspaces = await workspaceService.listUserWorkspaces(req.auth.userId);

        res.json({
            success: true,
            data: workspaces
        });
    },

  async createWorkspace(req: Request, res: Response) {
        if (!req.auth?.userId) {
            throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

        const workspace = await workspaceService.createWorkspace(req.body, req.auth.userId);
        res.status(201).json({ success: true, data: workspace });
    },

    async getWorkspaceDetail(req: Request, res: Response) {
        if (!req.auth?.userId) {
            throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { workspaceId } = req.params as { workspaceId: string };
        const workspaceDetail = await workspaceService.getWorkspaceDetail(workspaceId, req.auth.userId);
        res.json({ success: true, data: workspaceDetail });
    },

    async updateWorkSpace(req: Request, res: Response) {
        if (!req.auth?.userId) {
            throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { workspaceId } = req.params as { workspaceId: string };
        const updatedWorkspace = await workspaceService.updateWorkSpace(workspaceId, req.body, req.auth.userId);
        res.json({ success: true, data: updatedWorkspace });
    },

    async inviteWorkspaceMember(req: Request, res: Response) {
        if (!req.auth?.userId) {
            throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { workspaceId } = req.params as { workspaceId: string };
        const { email, role, tokenHash, expiresAt, status } = req.body as {
            email: string;
            role: string;
            tokenHash: string;
            expiresAt: Date;
            status?: string;
        };

        const result = await workspaceService.inviteWorkspaceMember(
            workspaceId,
            email,
            req.auth.userId,
            role,
            tokenHash,
            expiresAt,
            status
        );

        res.status(201).json(result);
    }
};
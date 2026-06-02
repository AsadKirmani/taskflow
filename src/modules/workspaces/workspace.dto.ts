import { z } from 'zod';

export const createWorkspaceDto = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(500).optional().default('')
});

export const updateWorkspaceDto = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  settings: z
    .object({
      allowMemberInvites: z.boolean().optional(),
      allowBoardCreationByMembers: z.boolean().optional(),
      defaultBoardVisibility: z.enum(['private', 'workspace']).optional()
    })
    .optional()
});

export const inviteWorkspaceMemberDto = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'team_lead', 'member'])
});

export const updateWorkspaceMemberRoleDto = z.object({
  role: z.enum(['admin', 'team_lead', 'member'])
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceDto>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceDto>;
export type InviteWorkspaceMemberDto = z.infer<typeof inviteWorkspaceMemberDto>;
export type UpdateWorkspaceMemberRoleDto = z.infer<typeof updateWorkspaceMemberRoleDto>;
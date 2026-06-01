export type WorkspaceRole = 'admin' | 'team_lead' | 'member';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount?: number;
  boardCount?: number;
  currentUserRole: WorkspaceRole;
}
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount?: number;
  boardCount?: number;
  currentUserRole: WorkspaceRole;
}
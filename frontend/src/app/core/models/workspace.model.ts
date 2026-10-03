export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  membersCount?: number;
  boardsCount?: number;
  currentUserRole: WorkspaceRole;
}

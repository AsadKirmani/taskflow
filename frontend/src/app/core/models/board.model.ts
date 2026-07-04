import { User } from './user.model';

export interface Board {
  id: string;
  workspaceId: string;
  workSpaceName?: string;
  name: string;
  description: string;
  visibility: 'private' | 'workspace';
  memberIds: User[];
  columnOrder: string[];
  archived: boolean;
  createdBy: string;
}

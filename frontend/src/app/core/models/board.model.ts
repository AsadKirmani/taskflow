export interface Board {
  id: string;
  workspaceId: string;
  workSpaceName?: string;
  name: string;
  description: string;
  visibility: 'private' | 'workspace';
  columnOrder: string[];
  archived: boolean;
  createdBy: string;
}
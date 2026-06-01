export interface BoardColumn {
  id: string;
  workspaceId: string;
  boardId: string;
  name: string;
  position: number;
  taskOrder: string[];
  archived?: boolean;
}
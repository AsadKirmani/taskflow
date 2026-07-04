export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskLabel {
  name: string;
  color: string;
}

export interface ChecklistItem {
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  workspaceId: string;
  boardId: string;
  columnId: string;
  position?: number;
  title: string;
  description: string;
  assigneeIds: string[];
  reporterId?: string;
  dueDate?: string | null;
  startDate?: string | null;
  priority: TaskPriority;
  labels: TaskLabel[];
  checklist?: ChecklistItem[];
  commentCount: number;
  attachments: { filename: string; url: string, format?: string, uploadedAt?: string }[];
  attachmentCount: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
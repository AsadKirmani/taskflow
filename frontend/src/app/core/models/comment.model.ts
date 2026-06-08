export interface TaskComment {
    id: string;
    workspaceId: string;
    boardId: string;
    taskId: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}
import { taskRepository } from "./task.repository";

export const taskService = {
  async createTask(
    title: string,
    description: string | undefined,
    columnId: string,
    boardId: string,
    workspaceId: string,
    userId: string,
  ) {
    const newTask = await taskRepository.createTask({
      title,
      description,
      columnId,
      boardId,
      workspaceId,
      reporterId: userId,
    });
    return newTask;
  },
    async getTasksInBoard(boardId: string) {
    const tasks = await taskRepository.getTasksInBoard(boardId);
    return tasks;
  },
  async getTaskById(taskId: string) {
    const task = await taskRepository.getTaskById(taskId);
    return task;
  },
  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      isCompleted?: boolean;
      completedAt?: Date | null;
    },
  ) {
    const updatedTask = await taskRepository.updateTask(taskId, data);
    return updatedTask;
  },
  async moveTask(
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    position: number,
  ) {
    await taskRepository.moveTask(taskId, sourceColumnId, destinationColumnId, position);
  },
};
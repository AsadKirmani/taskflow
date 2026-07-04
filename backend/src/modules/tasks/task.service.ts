import { taskRepository } from "./task.repository";
import { activityService } from "../activity/activity.service";
import { ColumnModel } from "../../models/column.model";
import { uploadBufferToCloudinary } from "../../services/cloudinary.service";

export type TaskDueType = "all" | "none" | "overdue" | "today" | "this_week";
export type TaskMemberScope = "all" | "no_members" | "me";
export type TaskCompletion = "all" | "completed" | "incomplete";
export type TaskActivity =
  | "recentlyupdated"
  | "recentlycreated"
  | "activeinlastweek"
  | "activeinlastmonth";

export interface TaskFilters {
  search?: string;
  priorities?: string[];
  assigneeIds?: string[];
  currentUserId?: string | null;
  memberScope?: TaskMemberScope;
  completion?: TaskCompletion;
  labels?: string[];
  dueType?: TaskDueType;
  activity?: TaskActivity[];
}

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

    await activityService.logActivity({
      workspaceId,
      boardId,
      columnId,
      taskId: newTask._id.toString(),
      userId,
      actionType: "task_created",
      entityType: "task",
      entityId: newTask._id.toString(),
      metadata: {
        title: newTask.title,
        priority: newTask.priority,
      },
    });

    return newTask;
  },
  async getTasksInBoard(boardId: string, filters?: TaskFilters) {
    const tasks = await taskRepository.getTasksInBoard(boardId, filters);
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
    userId?: string,
  ) {
    const previousTask = await taskRepository.getTaskById(taskId);
    const updatedTask = await taskRepository.updateTask(taskId, data);

    if (updatedTask && userId) {
      const actionType =
        typeof data.isCompleted === "boolean"
          ? data.isCompleted
            ? "task_completed"
            : "task_reopened"
          : "task_updated";

      await activityService.logActivity({
        workspaceId: updatedTask.workspaceId.toString(),
        boardId: updatedTask.boardId.toString(),
        columnId: updatedTask.columnId.toString(),
        taskId,
        userId,
        actionType,
        entityType: "task",
        entityId: taskId,
        metadata: {
          updatedFields: Object.keys(data),
          previousTitle: previousTask?.title,
          title: updatedTask.title,
        },
      });
    }

    return updatedTask;
  },
  async moveTask(
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    position: number,
    userId?: string,
  ) {
    const task = await taskRepository.getTaskById(taskId);
    const [sourceColumn, destinationColumn] = await Promise.all([
      ColumnModel.findById(sourceColumnId).select("name"),
      ColumnModel.findById(destinationColumnId).select("name"),
    ]);

    await taskRepository.moveTask(
      taskId,
      sourceColumnId,
      destinationColumnId,
      position,
    );

    if (task && userId) {
      await activityService.logActivity({
        workspaceId: task.workspaceId.toString(),
        boardId: task.boardId.toString(),
        columnId: destinationColumnId,
        taskId,
        userId,
        actionType: "task_moved",
        entityType: "task",
        entityId: taskId,
        metadata: {
          sourceColumnId,
          destinationColumnId,
          sourceColumnName: sourceColumn?.name,
          destinationColumnName: destinationColumn?.name,
          position,
        },
      });
    }
  },
  async deleteTask(taskId: string, userId?: string) {
    const task = await taskRepository.getTaskById(taskId);
    await taskRepository.deleteTask(taskId);
  },
  async addAttachment(
    taskId: string,
    attachment: Express.Multer.File,
    userId?: string,
  ) {
    const uploadAttachment = await uploadBufferToCloudinary(
      attachment.buffer,
      "attachments",
      attachment.mimetype,
    );
    const attachmentData = {
      filename: uploadAttachment.format
        ? `${attachment.originalname}.${uploadAttachment.format}`
        : attachment.originalname,
      url: uploadAttachment.secure_url,
      format: uploadAttachment.format,
      uploadedAt: new Date(),
    };
    await taskRepository.addAttachmentToTask(taskId, attachmentData);
    return attachmentData;
  },
  async removeAttachment(taskId: string, attachmentUrl: string) {
    const updatedTask = await taskRepository.removeAttachmentFromTask(
      taskId,
      attachmentUrl,
    );
    return updatedTask;
  },
};

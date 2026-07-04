import mongoose from "mongoose";
import { TaskModel } from "../../models/task.model";
import { ActivityModel } from "../../models/activity.model";
import { BoardModel } from "../../models/board.model";

export class DashboardRepository {
  async getDashboardStats(
    workspaceId: string,
    userId: string,
    dates: { startOfToday: Date; endOfToday: Date },
  ) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const uId = new mongoose.Types.ObjectId(userId);

    const [
      tasksDueToday,
      overdueTasks,
      completedTasks,
      newAssignmentsToday,
      activeBoards,
    ] = await Promise.all([
      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        isCompleted: false,
        dueDate: { $gte: dates.startOfToday, $lte: dates.endOfToday },
      }),

      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        isCompleted: false,
        dueDate: { $lt: dates.startOfToday },
      }),

      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        isCompleted: true,
      }),

      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        createdAt: { $gte: dates.startOfToday, $lte: dates.endOfToday },
      }),

      BoardModel.countDocuments({
        workspaceId: wsId,
        memberIds: uId,
        archived: false,
      }),
    ]);

    return {
      tasksDueToday,
      overdueTasks,
      completedTasks,
      newAssignmentsToday,
      activeBoards,
    };
  }

  async getRecentTasks(workspaceId: string, userId: string, limit = 8) {
    return TaskModel.find({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      assigneeIds: new mongoose.Types.ObjectId(userId),
      isCompleted: false,
    })
      .select("title dueDate priority isCompleted boardId")
      .populate("boardId", "name")
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean();
  }

  async getRecentActivities(workspaceId: string, limit = 5) {
    return ActivityModel.find({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name")
      .populate("taskId", "title")
      .populate("boardId", "name")
      .populate("workspaceId", "name")
      .lean();
  }
}

export const dashboardRepository = new DashboardRepository();

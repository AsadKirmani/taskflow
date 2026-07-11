import mongoose from "mongoose";
import { TaskModel } from "../../models/task.model";
import { ActivityModel } from "../../models/activity.model";
import { BoardModel } from "../../models/board.model";
import { ColumnModel } from "../../models/column.model";

export class DashboardRepository {
  private async getActiveBoardAndColumnIds(
    workspaceId: mongoose.Types.ObjectId,
  ) {
    const activeBoards = await BoardModel.find({
      workspaceId,
      archived: false,
    })
      .select("_id")
      .lean();
    const activeBoardIds = activeBoards.map((b) => b._id);

    const activeColumns = await ColumnModel.find({
      boardId: { $in: activeBoardIds },
      archived: false,
    })
      .select("_id")
      .lean();
    const activeColumnIds = activeColumns.map((c) => c._id);

    return { activeBoardIds, activeColumnIds };
  }

  private async getBaseTaskQuery(
    wsId: mongoose.Types.ObjectId,
    uId: mongoose.Types.ObjectId,
  ) {
    const { activeBoardIds, activeColumnIds } =
      await this.getActiveBoardAndColumnIds(wsId);

    return {
      workspaceId: wsId,
      assigneeIds: { $in: [uId] },
      archived: false,
      boardId: { $in: activeBoardIds },
      columnId: { $in: activeColumnIds },
    };
  }

  async getDashboardStats(
    workspaceId: string,
    userId: string,
    dates: { startOfToday: Date; endOfToday: Date },
  ) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const uId = new mongoose.Types.ObjectId(userId);
    const baseTaskQuery = await this.getBaseTaskQuery(wsId, uId);

    const [
      tasksDueToday,
      overdueTasks,
      completedTasks,
      newAssignmentsToday,
      activeBoards,
    ] = await Promise.all([
      TaskModel.countDocuments({
        ...baseTaskQuery,
        isCompleted: false,
        dueDate: { $gte: dates.startOfToday, $lte: dates.endOfToday },
      }),

      TaskModel.countDocuments({
        ...baseTaskQuery,
        isCompleted: false,
        dueDate: { $lt: dates.startOfToday },
      }),

      TaskModel.countDocuments({
        ...baseTaskQuery,
        isCompleted: true,
      }),

      TaskModel.countDocuments({
        ...baseTaskQuery,
        assignedAt: { $gte: dates.startOfToday, $lte: dates.endOfToday },
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
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const uId = new mongoose.Types.ObjectId(userId);
    const baseTaskQuery = await this.getBaseTaskQuery(wsId, uId);

    return TaskModel.find({
      ...baseTaskQuery,
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

// src/repositories/dashboard.repository.ts
import mongoose from 'mongoose';
import { TaskModel } from '../../models/task.model'; // Tera actual path
import { ActivityModel } from '../../models/activity.model';
import { BoardModel } from '../../models/board.model';

export class DashboardRepository {
  
  async getDashboardStats(workspaceId: string, userId: string, dates: { startOfToday: Date, endOfToday: Date }) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const uId = new mongoose.Types.ObjectId(userId);

    // 🚀 Parallel Execution for max speed
    const [
      tasksDueToday,
      overdueTasks,
      completedTasks,
      newAssignmentsToday,
      activeBoards  
    ] = await Promise.all([
      // 1. Due Today
      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        isCompleted: false,
        dueDate: { $gte: dates.startOfToday, $lte: dates.endOfToday },
      }),

      // 2. Overdue
      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        isCompleted: false,
        dueDate: { $lt: dates.startOfToday },
      }),

      // 3. Completed
      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        isCompleted: true,
      }),

      // 4. New Assignments
      TaskModel.countDocuments({
        workspaceId: wsId,
        assigneeIds: uId,
        createdAt: { $gte: dates.startOfToday, $lte: dates.endOfToday },
      }),

      // 5. Active Boards Count
      BoardModel.countDocuments({
        workspaceId: wsId,
        memberIds: uId,
        archived: false,
      })
    ]);

    return { tasksDueToday, overdueTasks, completedTasks, newAssignmentsToday, activeBoards };
  }

  async getRecentTasks(workspaceId: string, userId: string, limit = 8) {
    return TaskModel.find({
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        assigneeIds: new mongoose.Types.ObjectId(userId),
        isCompleted: false,
      })
      .select('title dueDate priority isCompleted boardId') 
      .populate('boardId', 'name') // Board ka naam get karne ke liye
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean(); // 🚀 makes query 3x faster
  }

  async getRecentActivities(workspaceId: string, limit = 5) {
    return ActivityModel.find({
        workspaceId: new mongoose.Types.ObjectId(workspaceId)
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name') // User ka naam get karne ke liye
      .populate('taskId', 'title') // Task ka title get karne ke liye
      .populate('boardId', 'name') // Board ka naam get karne ke liye
      .populate('workspaceId', 'name') // Workspace ka naam get karne ke liye
      .lean();
  }
}

export const dashboardRepository = new DashboardRepository();
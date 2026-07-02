import { dashboardRepository } from './dashboard.repository';

export class DashboardService {
  
  async getSummary(workspaceId: string, userId: string) {
    // 1. Calculate Dates
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const dates = { startOfToday, endOfToday };

    // 2. Fetch data parallelly
    const [stats, recentTasksRaw, recentActivities] = await Promise.all([
      dashboardRepository.getDashboardStats(workspaceId, userId, dates),
      dashboardRepository.getRecentTasks(workspaceId, userId),
      dashboardRepository.getRecentActivities(workspaceId)
    ]);

    // 3. Format Data for Frontend
    const recentTasks = recentTasksRaw.map((task: any) => ({
      id: task._id,
      boardId: task.boardId?._id,
      boardName: task.boardId?.name || 'Unknown board',
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      isCompleted: task.isCompleted
    }));

    return {
      stats,
      recentTasks,
      recentActivities
    };
  }
}

export const dashboardService = new DashboardService();
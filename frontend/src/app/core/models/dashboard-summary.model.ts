import type { Task } from './task.model';
import type { ActivityItem } from '../../features/activity/models/activity.model';
export interface DashboardSummary {
  stats: {
    tasksDueToday: number;
    overdueTasks: number;
    completedTasks: number;
    newAssignmentsToday: number;
    activeBoards: number;
  };
  recentTasks: Task[]; // Yahan tera TaskType aayega
  recentActivities: ActivityItem[]; // Yahan tera ActivityType aayega
}
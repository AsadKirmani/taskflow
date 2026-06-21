import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BoardApiService } from '../../../boards/data-access/board-api.service';
import { ActivityApiService } from '../../../activity/data-access/activity-api.service';
import { WorkspaceStoreService } from '../../../workspace/data-access/workspace-store.service';
import { Board } from '../../../../core/models/board.model';
import { Task } from '../../../../core/models/task.model';
import { ActivityItem, ActivityRef, formatActivityAction } from '../../../activity/models/activity.model';
import { CustomDatepickerComponent } from '../../../../shared/components/datepicker/custom-datepicker.component';

interface DashboardTaskRow {
  id: string;
  boardId: string;
  boardName: string;
  title: string;
  dueDate: string | null;
  priority: string;
  isCompleted: boolean;
}

interface DashboardVm {
  loading: boolean;
  error: string | null;
  tasksDueToday: number;
  overdueTasks: number;
  activeBoards: number;
  completedTasks: number;
  newAssignmentsToday: number;
  completedOnTime: number;
  tasks: DashboardTaskRow[];
  activities: ActivityItem[];
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink, CustomDatepickerComponent],
  templateUrl: './dashboard-page.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly boardApi = inject(BoardApiService);
  private readonly activityApi = inject(ActivityApiService);
  private readonly workspaceStore = inject(WorkspaceStoreService);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly rawBoards = signal<Board[]>([]);
  readonly rawTasks = signal<Task[]>([]);
  readonly rawActivities = signal<ActivityItem[]>([]);

  readonly vm = computed<DashboardVm>(() => {
    const boards = this.rawBoards();
    const tasks = this.rawTasks();
    const activities = this.rawActivities();
    const loading = this.loading();
    const error = this.error();

    const now = new Date();
    const notCompleted = tasks.filter(task => !task.isCompleted);
    const tasksDueToday = notCompleted.filter(task => this.isDueToday(task.dueDate, now)).length;
    const overdueTasks = notCompleted.filter(task => this.isOverdue(task.dueDate, now)).length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const newAssignmentsToday = tasks.filter(task => this.isSameDay(task.createdAt, now)).length;
    const completedOnTime = tasks.filter(task => task.isCompleted && !this.isOverdue(task.dueDate, now)).length;

    const boardById = new Map(boards.map(board => [board.id, board]));
    const boardIdsWithTasks = new Set(tasks.map(task => task.boardId));

    const taskRows = [...tasks]
      .sort((a, b) => {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      })
      .slice(0, 8)
      .map(task => ({
        id: task.id,
        boardId: task.boardId,
        boardName: boardById.get(task.boardId)?.name ?? 'Unknown board',
        title: task.title,
        dueDate: task.dueDate ?? null,
        priority: task.priority,
        isCompleted: !!task.isCompleted
      }));

    return {
      loading,
      error,
      tasksDueToday,
      overdueTasks,
      activeBoards: boardIdsWithTasks.size,
      completedTasks,
      newAssignmentsToday,
      completedOnTime,
      tasks: taskRows,
      activities
    };
  });

  async ngOnInit() {
    await this.loadDashboardData();
  }

  private async loadDashboardData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const boardsRes = await firstValueFrom(this.boardApi.getBoards());
      const normalizedBoards = this.normalizeBoards((boardsRes.data?.items ?? []) as (Board & { _id?: string })[]);
      this.rawBoards.set(normalizedBoards);

      if (normalizedBoards.length === 0) {
        this.loading.set(false);
        return;
      }

      const activeWsId = this.workspaceStore.activeWorkspace()?.id;
      const workspaceId = activeWsId || normalizedBoards[0]?.workspaceId;

      const taskPromises = normalizedBoards.map(async board => {
        try {
          const res = await firstValueFrom(this.boardApi.getTasksInBoard(board.id));
          return this.normalizeTasks((res.data?.items ?? []) as (Task & { _id?: string })[]).map(task => ({
            ...task,
            boardId: task.boardId || board.id
          }));
        } catch {
          return [];
        }
      });

      let activityPromise = Promise.resolve([] as ActivityItem[]);
      if (workspaceId) {
        activityPromise = firstValueFrom(this.activityApi.getWorkspaceActivity(workspaceId, 1, 5))
          .then(res => res.data?.items ?? [])
          .catch(() => [] as ActivityItem[]);
      }

      const [tasksArrays, activitiesData] = await Promise.all([
        Promise.all(taskPromises),
        activityPromise
      ]);

      this.rawTasks.set(tasksArrays.flat());
      this.rawActivities.set(activitiesData);

    } catch (err) {
      this.error.set('Failed to load dashboard data');
    } finally {
      this.loading.set(false);
    }
  }

  readonly priorityClassMap: Record<string, string> = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    urgent: 'text-red-500'
  };

  getTaskStatusClass(task: DashboardTaskRow): string {
    return task.isCompleted ? 'text-green-500' : 'text-blue-500';
  }

  getPriorityClass(priority: string): string {
    return this.priorityClassMap[priority.toLowerCase()] ?? 'text-gray-500';
  }

  getBoardRoute(boardId: string, boardName: string): string[] {
    return ['/boards', boardId, this.toSlug(boardName || 'board')];
  }

  getTaskQueryParams(task: DashboardTaskRow): Record<string, string> {
    return {
      taskId: task.id,
      taskTitle: this.toSlug(task.title)
    };
  }

  describeActivity(item: ActivityItem): string {
    const actor = this.getRef(item.userId)?.name || 'Someone';
    const task = this.getRef(item.taskId)?.title;
    const board = this.getRef(item.boardId)?.name;
    const action = formatActivityAction(item.actionType);

    if (task) {
      return `${actor} ${action} "${task}"`;
    }

    if (board) {
      return `${actor} ${action} on board "${board}"`;
    }

    return `${actor} ${action}`;
  }

  private normalizeBoards(boards: (Board & { _id?: string })[]): Board[] {
    return boards.map(board => ({
      ...board,
      id: board.id ?? board._id ?? ''
    }));
  }

  private normalizeTasks(tasks: (Task & { _id?: string })[]): Task[] {
    return tasks.map(task => ({
      ...task,
      id: task.id ?? task._id ?? ''
    }));
  }

  private isDueToday(dueDate: string | null | undefined, now: Date): boolean {
    if (!dueDate) {
      return false;
    }
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
      return false;
    }
    return due.toDateString() === now.toDateString();
  }

  private isOverdue(dueDate: string | null | undefined, now: Date): boolean {
    if (!dueDate) {
      return false;
    }
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
      return false;
    }
    return due.getTime() < now.getTime();
  }

  private isSameDay(value: string | null | undefined, now: Date): boolean {
    if (!value) {
      return false;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    return date.toDateString() === now.toDateString();
  }

  private getRef(value: string | ActivityRef | null | undefined): ActivityRef | null {
    if (!value || typeof value === 'string') {
      return null;
    }
    return value;
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  }
}
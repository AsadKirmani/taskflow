import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { BoardApiService } from '../../boards/data-access/board-api.service';
import { ActivityApiService } from '../../activity/data-access/activity-api.service';
import { WorkspaceStoreService } from '../../workspace/data-access/workspace-store.service';
import { Board } from '../../../core/models/board.model';
import { Task } from '../../../core/models/task.model';
import { ActivityItem } from '../../activity/models/activity.model';

// --- Pure Helper Functions ---
const isDueToday = (dueDate: string | null | undefined, now: Date) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  return !Number.isNaN(due.getTime()) && due.toDateString() === now.toDateString();
};

const isOverdue = (dueDate: string | null | undefined, now: Date) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  return !Number.isNaN(due.getTime()) && due.getTime() < now.getTime();
};

const isSameDay = (value: string | null | undefined, now: Date) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toDateString() === now.toDateString();
};

// --- State Definitions ---
type DashboardState = {
  loading: boolean;
  error: string | null;
  boards: Board[];
  tasks: Task[];
  activities: ActivityItem[];
};

const initialState: DashboardState = {
  loading: true,
  error: null,
  boards: [],
  tasks: [],
  activities: []
};

// --- The SignalStore ---
export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  // 🚀 1. COMPUTED SIGNALS REFACTORED
  withComputed(({ boards, tasks, loading, error }) => {
    
    // 💡 Fix #1: Dynamic 'now' generator to prevent stale dates
    const getNow = () => new Date(); 
    
    // 💡 Fix #3: Reusable filtered arrays to prevent redundant filtering
    const notCompletedTasks = computed(() => tasks().filter(t => !t.isCompleted));
    const completedTasksArr = computed(() => tasks().filter(t => t.isCompleted));
    
    // 💡 Smell #2 noted: Left as Map for now, can optimize later if scale increases
    const boardById = computed(() => new Map(boards().map(b => [b.id, b])));
    
    return {
      isLoading: computed(() => loading()),
      hasError: computed(() => error()),
      
      tasksDueToday: computed(() => notCompletedTasks().filter(task => isDueToday(task.dueDate, getNow())).length),
      overdueTasks: computed(() => notCompletedTasks().filter(task => isOverdue(task.dueDate, getNow())).length),
      activeBoards: computed(() => new Set(tasks().map(task => task.boardId)).size),
      
      completedTasks: computed(() => completedTasksArr().length),
      completedOnTime: computed(() => completedTasksArr().filter(task => !isOverdue(task.dueDate, getNow())).length),
      newAssignmentsToday: computed(() => tasks().filter(task => isSameDay(task.createdAt, getNow())).length),
      
      recentTaskRows: computed(() => {
        return [...tasks()]
          .sort((a, b) => {
            const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            return aDue - bDue;
          })
          .slice(0, 8)
          .map(task => ({
            id: task.id,
            boardId: task.boardId,
            boardName: boardById().get(task.boardId)?.name ?? 'Unknown board',
            title: task.title,
            dueDate: task.dueDate ?? null,
            priority: task.priority,
            isCompleted: !!task.isCompleted
          }));
      })
    };
  }),

  // 🚀 2. METHODS REFACTORED (Broken down into private helpers)
  withMethods((
    store, 
    boardApi = inject(BoardApiService), 
    activityApi = inject(ActivityApiService),
    workspaceStore = inject(WorkspaceStoreService)
  ) => {

    // --- Private Helper Methods (Not exposed to Component) ---
    
    const fetchBoards = async (): Promise<Board[]> => {
      const res = await firstValueFrom(boardApi.getBoards());
      return (res.data?.items ?? []).map((b: any) => ({ ...b, id: b.id ?? b._id ?? '' }));
    };

    const fetchTasksForBoards = async (boards: Board[]): Promise<Task[]> => {
      const taskPromises = boards.map(async board => {
        try {
          const res = await firstValueFrom(boardApi.getTasksInBoard(board.id));
          return (res.data?.items ?? []).map((t: any) => ({
            ...t,
            id: t.id ?? t._id ?? '',
            boardId: t.boardId || board.id
          }));
        } catch { return []; }
      });
      const tasksArrays = await Promise.all(taskPromises);
      return tasksArrays.flat();
    };

    const fetchActivities = async (workspaceId: string | undefined): Promise<ActivityItem[]> => {
      if (!workspaceId) return [];
      try {
        const res = await firstValueFrom(activityApi.getWorkspaceActivity(workspaceId, 1, 5));
        return res.data?.items ?? [];
      } catch { return []; }
    };

    // --- Public Exposed Methods ---
    
    return {
      async loadDashboardData() {
        patchState(store, { loading: true, error: null });

        try {
          // 💡 Fix #4: Clean and readable orchestration
          const boards = await fetchBoards();
          patchState(store, { boards });

          if (boards.length === 0) {
            patchState(store, { loading: false });
            return;
          }

          const activeWsId = workspaceStore.activeWorkspace()?.id;
          const workspaceId = activeWsId || boards[0]?.workspaceId;

          const [tasks, activities] = await Promise.all([
            fetchTasksForBoards(boards),
            fetchActivities(workspaceId)
          ]);

          patchState(store, { tasks, activities, loading: false });

        } catch (err) {
          patchState(store, { error: 'Failed to load dashboard data', loading: false });
        }
      }
    };
  })
);
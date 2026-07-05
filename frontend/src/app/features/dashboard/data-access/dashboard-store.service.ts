import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState, withHooks } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { DashboardApiService, DashboardSummary, DashboardTaskRow } from './dashboard-api.service';
import { EventBusService } from '../../../core/services/event-bus.service';

type DashboardState = {
  workspaceId: string | null;
  loading: boolean;
  error: string | null;
  isLoaded: boolean;
  stats: DashboardSummary['stats'];
  recentTaskRows: DashboardSummary['recentTasks'];
  recentActivities: DashboardSummary['recentActivities'];
};

const initialState: DashboardState = {
  workspaceId: null,
  loading: true,
  error: null,
  isLoaded: false,
  stats: {
    tasksDueToday: 0,
    overdueTasks: 0,
    completedTasks: 0,
    newAssignmentsToday: 0,
    activeBoards: 0,
  },
  recentTaskRows: [],
  recentActivities: [],
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  
  withComputed((state) => ({
    isLoading: computed(() => state.loading()),
    hasError: computed(() => state.error()),
    
    tasksDueToday: computed(() => state.stats().tasksDueToday),
    overdueTasks: computed(() => state.stats().overdueTasks),
    activeBoards: computed(() => state.stats().activeBoards),
    completedTasks: computed(() => state.stats().completedTasks),
    completedOnTime: computed(() => 0),
    newAssignmentsToday: computed(() => state.stats().newAssignmentsToday),
  })),
  
  withMethods((store, dashboardApi = inject(DashboardApiService)) => ({
    async loadDashboardData(workspaceId: string, userId: string, forceReload = false) {
      if (
        store.isLoaded() &&
        !forceReload &&
        !store.error() &&
        store.workspaceId() === workspaceId
      ) {
        return;
      }
      if (!workspaceId) {
        patchState(store, { error: 'No active workspace found', loading: false });
        return;
      }
      
      patchState(store, { loading: true, error: null });
      
      try {
        const response = await firstValueFrom(
          dashboardApi.getDashboardSummary(workspaceId, userId),
        );
        const data = response.data;
        patchState(store, {
          workspaceId,
          stats: data.stats,
          recentTaskRows: data.recentTasks.map((task: DashboardTaskRow) => ({
            id: task.id,
            boardId: task.boardId,
            boardName: task.boardName,
            title: task.title,
            dueDate: task.dueDate,
            priority: task.priority,
            isCompleted: task.isCompleted,
          })),
          recentActivities: data.recentActivities,
          loading: false,
          isLoaded: true,
        });
      } catch (err) {
        patchState(store, { error: 'Failed to load dashboard data', loading: false });
      }
    },
    setEmptyWorkspaceState() {
      patchState(store, {
        workspaceId: null,
        loading: false,
        error: null,
        isLoaded: true,
        stats: {
          tasksDueToday: 0,
          overdueTasks: 0,
          completedTasks: 0,
          newAssignmentsToday: 0,
          activeBoards: 0,
        },
        recentTaskRows: [],
        recentActivities: [],
      });
    },
    resetDashboardState() {
      patchState(store, {
        workspaceId: null,
        loading: true,
        error: null,
        isLoaded: false,
        stats: {
          tasksDueToday: 0,
          overdueTasks: 0,
          completedTasks: 0,
          newAssignmentsToday: 0,
          activeBoards: 0,
        },
        recentTaskRows: [],
        recentActivities: [],
      });
    },
  })),
  withHooks({
    onInit(store, eventBus = inject(EventBusService)) {
      
      eventBus.taskUpdated$.subscribe(() => {
        store.loadDashboardData(store.workspaceId() ?? '', '', true);
      });
      
    }
  })
)

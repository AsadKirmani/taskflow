import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject, catchError, debounceTime, distinctUntilChanged, map, of, tap } from 'rxjs';
import { BoardColumn } from '../../../core/models/column.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Task } from '../../../core/models/task.model';
import { TaskDropEventPayload } from '../models/drag-drop.model';
import { BoardApiService } from './board-api.service';
import { BoardFilters } from './board-state.model';
import { TaskState, initialTaskState } from './task-state.model';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly api = inject(BoardApiService);
  private readonly notificationService = inject(NotificationService);
  private currentBoardId: string | null = null;
  private readonly filterTrigger$ = new Subject<string>();

  private readonly stateSubject = new BehaviorSubject<TaskState>(initialTaskState);
  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    this.filterTrigger$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        if (this.currentBoardId) {
          this.fetchTasksWithFilters(this.currentBoardId);
        }
      });
  }

  readonly vm$ = this.state$.pipe(
    map(state => ({
      loading: state.loading,
      saving: state.saving,
      error: state.error
    }))
  );

  getTasksInBoard(boardId: string, columns: BoardColumn[] = []): void {
    if (!boardId?.trim()) {
      this.notificationService.error('Board ID is missing');
      return;
    }

    this.currentBoardId = boardId;
    this.patchState({ loading: true, error: null });

    this.api
      .getTasksInBoard(boardId)
      .pipe(
        map(response => this.normalizeTasks((response.data?.items ?? []) as (Task & { _id?: string })[])),
        tap(tasks => {
          const tasksById = tasks.reduce<Record<string, Task>>((acc, task) => {
            acc[task.id] = task;
            return acc;
          }, {});

          const tasksGroupedByColumn = tasks.reduce<Record<string, Task[]>>((acc, task) => {
            if (!acc[task.columnId]) {
              acc[task.columnId] = [];
            }
            acc[task.columnId].push(task);
            return acc;
          }, {});

          for (const columnId of Object.keys(tasksGroupedByColumn)) {
            tasksGroupedByColumn[columnId].sort((a, b) => {
              const aPosition = a.position ?? Number.MAX_SAFE_INTEGER;
              const bPosition = b.position ?? Number.MAX_SAFE_INTEGER;
              return aPosition - bPosition;
            });
          }

          const taskIdsByColumn = columns.reduce<Record<string, string[]>>((acc, column) => {
            acc[column.id] = (tasksGroupedByColumn[column.id] ?? []).map(task => task.id);
            return acc;
          }, {});

          for (const [columnId, groupedTasks] of Object.entries(tasksGroupedByColumn)) {
            if (!taskIdsByColumn[columnId]) {
              taskIdsByColumn[columnId] = groupedTasks.map(task => task.id);
            }
          }

          this.patchState({ tasksById, taskIdsByColumn, loading: false, error: null });
          this.notificationService.success('Board tasks loaded successfully');
        }),
        catchError(() => {
          this.patchState({ loading: false, error: 'Failed to load board tasks' });
          this.notificationService.error('Failed to load board tasks');
          return of([]);
        })
      )
      .subscribe();
  }

  addTask(boardId: string, columnId: string, title: string, workspaceId: string, position?: number): void {
    if (!boardId?.trim() || !columnId?.trim() || !title?.trim() || !workspaceId?.trim()) {
      this.notificationService.error('Board ID, Column ID, Title, and Workspace ID are required');
      return;
    }

    this.api
      .addTask(boardId, columnId, title, workspaceId, position)
      .pipe(
        map(response => this.normalizeTasks([response.data as Task & { _id?: string }])[0]),
        tap(task => {
          const state = this.getState();
          this.patchState({
            tasksById: {
              ...state.tasksById,
              [task.id]: task
            },
            taskIdsByColumn: {
              ...state.taskIdsByColumn,
              [columnId]: [...(state.taskIdsByColumn[columnId] ?? []), task.id]
            }
          });
          this.notificationService.success('Task added successfully');
        }),
        catchError(() => {
          this.notificationService.error('Failed to add task');
          return of(null);
        })
      )
      .subscribe();
  }

  updateTask(
    boardId: string,
    taskId: string,
    updates: { title?: string; description?: string; isCompleted?: boolean }
  ): void {
    if (!boardId?.trim() || !taskId?.trim()) {
      this.notificationService.error('Board ID and Task ID are required');
      return;
    }

    const state = this.getState();
    const existingTask = state.tasksById[taskId];
    if (!existingTask) {
      this.notificationService.error('Task not found');
      return;
    }

    this.api
      .updateTask(boardId, taskId, updates)
      .pipe(
        map(response => this.normalizeTasks([response.data as Task & { _id?: string }])[0]),
        tap(updatedTask => {
          this.patchState({
            tasksById: {
              ...this.getState().tasksById,
              [taskId]: {
                ...existingTask,
                ...updatedTask
              }
            }
          });
          this.notificationService.success('Task updated successfully');
        }),
        catchError(() => {
          this.notificationService.error('Failed to update task');
          return of(null);
        })
      )
      .subscribe();
  }

  handleTaskDrop(boardId: string, event: TaskDropEventPayload): void {
    if (!boardId?.trim()) {
      this.notificationService.error('Board not loaded');
      return;
    }

    const snapshot = structuredClone(this.getState());
    this.applyOptimisticTaskMove(event);

    this.api
      .moveTask(boardId, event.taskId, {
        sourceColumnId: event.sourceColumnId,
        targetColumnId: event.targetColumnId,
        sourceIndex: event.sourceIndex,
        targetIndex: event.targetIndex,
        destinationColumnId: event.targetColumnId,
        position: event.targetIndex
      })
      .pipe(
        tap(() => {
          this.notificationService.success('Task moved successfully');
        }),
        catchError(() => {
          this.stateSubject.next(snapshot);
          this.notificationService.error('Failed to move task');
          return of(null);
        })
      )
      .subscribe();
  }

  updateFilters(filters: Partial<BoardFilters>): void {
    const state = this.getState();
    this.patchState({
      filters: {
        ...state.filters,
        ...filters
      }
    });

    if (this.currentBoardId) {
      this.filterTrigger$.next(this.serializeFilters(this.getState().filters));
    }
  }

  buildTasksByColumn(columns: BoardColumn[]): Record<string, Task[]> {
    const state = this.getState();
    return Object.fromEntries(
      columns.map(column => [
        column.id,
        (state.taskIdsByColumn[column.id] ?? [])
          .map(id => state.tasksById[id])
          .filter(Boolean)
          .filter(task => this.matchesFilters(task, state.filters))
      ])
    );
  }

  toggleTaskCompletion(boardId: string, taskId: string, isCompleted: boolean): void {
    this.updateTask(boardId, taskId, { isCompleted });
  }

  private applyOptimisticTaskMove(event: TaskDropEventPayload): void {
    const state = this.getState();

    const sourceIds = [...(state.taskIdsByColumn[event.sourceColumnId] ?? [])];
    const targetIds =
      event.sourceColumnId === event.targetColumnId
        ? sourceIds
        : [...(state.taskIdsByColumn[event.targetColumnId] ?? [])];

    sourceIds.splice(event.sourceIndex, 1);
    targetIds.splice(event.targetIndex, 0, event.taskId);

    const taskIdsByColumn = {
      ...state.taskIdsByColumn,
      [event.sourceColumnId]:
        event.sourceColumnId === event.targetColumnId ? targetIds : sourceIds,
      [event.targetColumnId]: targetIds
    };

    const existingTask = state.tasksById[event.taskId];

    this.patchState({
      taskIdsByColumn,
      tasksById: {
        ...state.tasksById,
        [event.taskId]: {
          ...existingTask,
          columnId: event.targetColumnId
        }
      }
    });
  }

  private matchesFilters(task: Task, filters: BoardFilters): boolean {
    const matchesSearch =
      !filters.search ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesPriority =
      filters.priorities.length === 0 || filters.priorities.includes(task.priority);

    const matchesAssignee =
      filters.assigneeIds.length === 0 ||
      filters.assigneeIds.some(id => task.assigneeIds.includes(id));

    const matchesMemberScope =
      filters.memberScope === 'all' ||
      (filters.memberScope === 'no_members' && task.assigneeIds.length === 0) ||
      (filters.memberScope === 'me' &&
        !!filters.currentUserId &&
        task.assigneeIds.includes(filters.currentUserId));

    const matchesCompletion =
      filters.completion === 'all' ||
      (filters.completion === 'completed' && !!task.isCompleted) ||
      (filters.completion === 'incomplete' && !task.isCompleted);

    const matchesDueType = this.matchesDueType(task, filters.dueType);

    const matchesLabels =
      filters.labels.length === 0 ||
      filters.labels.some(label => {
        if (label === 'no_color') {
          return task.labels.length === 0;
        }

        const normalized = label.toLowerCase();
        return task.labels.some(
          taskLabel =>
            taskLabel.name.toLowerCase() === normalized ||
            taskLabel.color.toLowerCase().includes(normalized)
        );
      });

    const matchesActivity = this.matchesActivity(task, filters.activity);

    return (
      matchesSearch &&
      matchesPriority &&
      matchesAssignee &&
      matchesMemberScope &&
      matchesCompletion &&
      matchesDueType &&
      matchesLabels &&
      matchesActivity
    );
  }

  private matchesDueType(task: Task, dueType: BoardFilters['dueType']): boolean {
    if (dueType === 'all') {
      return true;
    }

    if (!task.dueDate) {
      return dueType === 'none';
    }

    if (dueType === 'none') {
      return false;
    }

    const now = new Date();
    const dueDate = new Date(task.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    if (dueType === 'overdue') {
      return dueDate.getTime() < now.getTime();
    }

    if (dueType === 'today') {
      return dueDate.toDateString() === now.toDateString();
    }

    const start = new Date(now);
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return dueDate >= start && dueDate < end;
  }

  private matchesActivity(task: Task, activity: BoardFilters['activity']): boolean {
    if (activity.length === 0) {
      return true;
    }

    const now = Date.now();
    const updatedAt = task.updatedAt ? new Date(task.updatedAt).getTime() : null;
    const createdAt = task.createdAt ? new Date(task.createdAt).getTime() : null;

    const within = (value: number | null, days: number): boolean => {
      if (!value || Number.isNaN(value)) {
        return false;
      }

      return value >= now - days * 24 * 60 * 60 * 1000;
    };

    return activity.some(type => {
      switch (type) {
        case 'recentlyupdated':
          return within(updatedAt, 1);
        case 'recentlycreated':
          return within(createdAt, 1);
        case 'activeinlastweek':
          return within(updatedAt, 7) || within(createdAt, 7);
        case 'activeinlastmonth':
          return within(updatedAt, 30) || within(createdAt, 30);
        default:
          return true;
      }
    });
  }

  private patchState(partial: Partial<TaskState>): void {
    this.stateSubject.next({
      ...this.getState(),
      ...partial
    });
  }

  private getState(): TaskState {
    return this.stateSubject.getValue();
  }

  private normalizeTasks(tasks: (Task & { _id?: string })[]): Task[] {
    return tasks.map(task => ({
      ...task,
      id: task.id ?? task._id ?? ''
    }));
  }

  private fetchTasksWithFilters(boardId: string): void {
    const state = this.getState();
    this.patchState({ loading: true, error: null });

    this.api
      .getTasksInBoard(boardId, {
        search: state.filters.search,
        priorities: state.filters.priorities,
        assigneeIds: state.filters.assigneeIds,
        labels: state.filters.labels,
        activity: state.filters.activity,
        memberScope: state.filters.memberScope,
        completion: state.filters.completion,
        dueType: state.filters.dueType
      })
      .pipe(
        map(response => this.normalizeTasks((response.data?.items ?? []) as (Task & { _id?: string })[])),
        tap(tasks => {
          const tasksById = tasks.reduce<Record<string, Task>>((acc, task) => {
            acc[task.id] = task;
            return acc;
          }, {});

          const taskIdsByColumn = tasks.reduce<Record<string, string[]>>((acc, task) => {
            if (!acc[task.columnId]) {
              acc[task.columnId] = [];
            }
            acc[task.columnId].push(task.id);
            return acc;
          }, {});

          this.patchState({ tasksById, taskIdsByColumn, loading: false, error: null });
        }),
        catchError(() => {
          this.patchState({ loading: false, error: 'Failed to apply task filters' });
          this.notificationService.error('Failed to apply task filters');
          return of([]);
        })
      )
      .subscribe();
  }

  private serializeFilters(filters: BoardFilters): string {
    return JSON.stringify({
      search: filters.search,
      priorities: [...filters.priorities].sort(),
      assigneeIds: [...filters.assigneeIds].sort(),
      memberScope: filters.memberScope,
      completion: filters.completion,
      labels: [...filters.labels].sort(),
      dueType: filters.dueType,
      activity: [...filters.activity].sort(),
      currentUserId: filters.currentUserId
    });
  }
}

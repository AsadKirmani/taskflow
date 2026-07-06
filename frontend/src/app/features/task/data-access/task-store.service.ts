import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { firstValueFrom, of, pipe } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';

import { BoardColumn } from '../../../core/models/column.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Task } from '../../../core/models/task.model';
import { TaskDropEventPayload } from '../../boards/models/drag-drop.model';
import { TaskApiService } from './task-api.service';
import { BoardFilters } from '../../boards/data-access/board-state.model';
import { TaskState, initialTaskState } from './task-state.model';
import { TaskComment } from '../../../core/models/comment.model';
import { ArchiveService } from '../../../core/services/archive.service';
import { EventBusService } from '../../../core/services/event-bus.service';

const normalizeTasks = (tasks: any[]): Task[] =>
  tasks.map((t) => ({ ...t, id: t.id ?? t._id ?? '' }));

type ExtendedTaskState = TaskState & {
  comments: TaskComment[];
  currentBoardId: string | null;
  loadedTaskBoardIds: string[];
  loadingTaskBoardIds: string[];
};

const initialState: ExtendedTaskState = {
  ...initialTaskState,
  comments: [],
  currentBoardId: null,
  loadedTaskBoardIds: [],
  loadingTaskBoardIds: [],
};

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ loading, saving, error, comments, filters }) => ({
    isLoading: computed(() => loading()),
    isSaving: computed(() => saving()),
    hasError: computed(() => error()),
    taskComments: computed(() => comments()),
    currentFilters: computed(() => filters()),
  })),

  withMethods(
    (
      store,
      api = inject(TaskApiService),
      notification = inject(NotificationService),
      archive = inject(ArchiveService),
      eventBus = inject(EventBusService),
    ) => {
      const triggerFilterFetch = rxMethod<string>(
        pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(() => {
            const boardId = store.currentBoardId();
            if (!boardId) return of(null);
            patchState(store, { loading: true, error: null });
            const f = store.filters();

            return api
              .getTasksInBoard(boardId, {
                search: f.search,
                priorities: f.priorities,
                assigneeIds: f.assigneeIds,
                labels: f.labels,
                activity: f.activity,
                memberScope: f.memberScope,
                completion: f.completion,
                dueType: f.dueType,
              })
              .pipe(
                tap((res) => {
                  const tasks = normalizeTasks(res.data?.items ?? []);
                  const tasksById: Record<string, Task> = {};
                  const taskIdsByColumn: Record<string, string[]> = {};

                  tasks.forEach((t) => {
                    tasksById[t.id] = t;
                    if (!taskIdsByColumn[t.columnId]) taskIdsByColumn[t.columnId] = [];
                    taskIdsByColumn[t.columnId].push(t.id);
                  });

                  patchState(store, { tasksById, taskIdsByColumn, loading: false });
                }),
                catchError(() => {
                  patchState(store, { loading: false, error: 'Failed to apply filters' });
                  notification.error('Failed to apply task filters');
                  return of(null);
                }),
              );
          }),
        ),
      );

      return {
        async getTasksInBoard(boardId: string, columns: BoardColumn[] = [], force = false) {
          if (!boardId?.trim() || store.loadingTaskBoardIds().includes(boardId)) return;
          if (store.loadedTaskBoardIds().includes(boardId) && !force) return;

          patchState(store, {
            loading: true,
            error: null,
            currentBoardId: boardId,
            loadingTaskBoardIds: [...new Set([...store.loadingTaskBoardIds(), boardId])],
          });

          try {
            const res = await firstValueFrom(api.getTasksInBoard(boardId));
            const tasks = normalizeTasks(res.data?.items ?? []);

            const tasksById: Record<string, Task> = {};
            const tasksGroupedByColumn: Record<string, Task[]> = {};

            tasks.forEach((t) => {
              tasksById[t.id] = t;
              if (!tasksGroupedByColumn[t.columnId]) tasksGroupedByColumn[t.columnId] = [];
              tasksGroupedByColumn[t.columnId].push(t);
            });

            for (const colId of Object.keys(tasksGroupedByColumn)) {
              tasksGroupedByColumn[colId].sort(
                (a, b) => (a.position ?? 999999) - (b.position ?? 999999),
              );
            }

            const taskIdsByColumn: Record<string, string[]> = {};
            columns.forEach(
              (c) => (taskIdsByColumn[c.id] = (tasksGroupedByColumn[c.id] ?? []).map((t) => t.id)),
            );
            Object.keys(tasksGroupedByColumn).forEach((colId) => {
              if (!taskIdsByColumn[colId])
                taskIdsByColumn[colId] = tasksGroupedByColumn[colId].map((t) => t.id);
            });

            patchState(store, {
              tasksById,
              taskIdsByColumn,
              loading: false,
              filters: initialTaskState.filters,
              loadedTaskBoardIds: [...new Set([...store.loadedTaskBoardIds(), boardId])],
              loadingTaskBoardIds: store.loadingTaskBoardIds().filter((id) => id !== boardId),
            });
          } catch (err) {
            patchState(store, {
              loading: false,
              error: 'Failed to load board tasks',
              loadingTaskBoardIds: store.loadingTaskBoardIds().filter((id) => id !== boardId),
            });
            notification.error('Failed to load board tasks');
          }
        },

        updateFilters(filters: Partial<BoardFilters>) {
          patchState(store, { filters: { ...store.filters(), ...filters } });
          const boardId = store.currentBoardId();
          if (boardId) {
            triggerFilterFetch(JSON.stringify(store.filters()));
          }
        },

        buildTasksByColumn(columns: BoardColumn[]): Record<string, Task[]> {
          const stateTasks = store.tasksById();
          const stateIdsByCol = store.taskIdsByColumn();
          return Object.fromEntries(
            columns.map((column) => [
              column.id,
              (stateIdsByCol[column.id] ?? [])
                .map((id) => stateTasks[id])
                .filter(Boolean)
            ]),
          );
        },

        async addTask(
          boardId: string,
          columnId: string,
          title: string,
          workspaceId: string,
          position?: number,
        ) {
          if (!boardId?.trim() || !columnId?.trim() || !title?.trim() || !workspaceId?.trim())
            return;

          try {
            const res = await firstValueFrom(
              api.addTask(boardId, columnId, title, workspaceId, position),
            );
            const newTask = normalizeTasks([res.data])[0];

            patchState(store, {
              tasksById: { ...store.tasksById(), [newTask.id]: newTask },
              taskIdsByColumn: {
                ...store.taskIdsByColumn(),
                [columnId]: [...(store.taskIdsByColumn()[columnId] ?? []), newTask.id],
              },
            });
            eventBus.notifyTaskUpdate();
          } catch (err) {
            notification.error('Failed to add task');
          }
        },

        async updateTask(taskId: string, updates: Partial<Task>) {
          if (!taskId?.trim()) return;
          const existingTask = store.tasksById()[taskId];
          if (!existingTask) return;

          patchState(store, {
            tasksById: { ...store.tasksById(), [taskId]: { ...existingTask, ...updates } },
          });

          try {
            await firstValueFrom(api.updateTask(taskId, updates));
            eventBus.notifyTaskUpdate();
          } catch (err) {
            patchState(store, { tasksById: { ...store.tasksById(), [taskId]: existingTask } });
            notification.error('Failed to update task');
          }
        },

        toggleTaskCompletion(taskId: string, isCompleted: boolean) {
          this.updateTask(taskId, { isCompleted });
        },

        async archiveTask(taskId: string, workspaceId: string, taskTitle: string, reason?: string) {
          if (!taskId?.trim()) return;

          const existingTask = store.tasksById()[taskId];
          if (!existingTask) return;

          const columnId = existingTask.columnId;
          const originalTaskIdsByColumn = { ...store.taskIdsByColumn() };
          const originalTasksById = { ...store.tasksById() };

          const updatedTaskIdsByColumn = { ...originalTaskIdsByColumn };
          updatedTaskIdsByColumn[columnId] = (updatedTaskIdsByColumn[columnId] ?? []).filter(
            (id) => id !== taskId,
          );

          const updatedTasksById = { ...originalTasksById };
          delete updatedTasksById[taskId];

          patchState(store, {
            taskIdsByColumn: updatedTaskIdsByColumn,
            tasksById: updatedTasksById,
          });

          try {
            await firstValueFrom(
              archive.archive({
                workspaceId,
                entityType: 'task',
                entityId: taskId,
                entityName: taskTitle,
                reason,
              }),
            );
            notification.success('Task archived successfully');
          } catch (err) {
            patchState(store, {
              taskIdsByColumn: originalTaskIdsByColumn,
              tasksById: originalTasksById,
            });
            notification.error('Failed to archive task');
          }
        },

        async restoreTask(taskId: string, workspaceId: string, taskTitle: string) {
          try {
            await firstValueFrom(
              archive.restore({
                workspaceId,
                entityType: 'task',
                entityId: taskId,
                entityName: taskTitle,
              }),
            );
            notification.success('Task restored successfully');

            const currentBoardId = store.currentBoardId();
            if (currentBoardId) {
              await this.getTasksInBoard(currentBoardId, [], true);
            }
          } catch (err) {
            notification.error('Failed to restore task');
          }
        },

        async handleTaskDrop(boardId: string, event: TaskDropEventPayload) {
          if (!boardId?.trim()) return;

          const originalTasksById = { ...store.tasksById() };
          const originalTaskIdsByCol = { ...store.taskIdsByColumn() };

          const sourceIds = [...(originalTaskIdsByCol[event.sourceColumnId] ?? [])];
          const targetIds =
            event.sourceColumnId === event.targetColumnId
              ? sourceIds
              : [...(originalTaskIdsByCol[event.targetColumnId] ?? [])];

          sourceIds.splice(event.sourceIndex, 1);
          targetIds.splice(event.targetIndex, 0, event.taskId);

          patchState(store, {
            taskIdsByColumn: {
              ...originalTaskIdsByCol,
              [event.sourceColumnId]:
                event.sourceColumnId === event.targetColumnId ? targetIds : sourceIds,
              [event.targetColumnId]: targetIds,
            },
            tasksById: {
              ...originalTasksById,
              [event.taskId]: {
                ...originalTasksById[event.taskId],
                columnId: event.targetColumnId,
              },
            },
          });

          try {
            await firstValueFrom(
              api.moveTask(event.taskId, {
                sourceColumnId: event.sourceColumnId,
                targetColumnId: event.targetColumnId,
                sourceIndex: event.sourceIndex,
                targetIndex: event.targetIndex,
                destinationColumnId: event.targetColumnId,
                position: event.targetIndex,
              }),
            );
          } catch (err) {
            patchState(store, {
              tasksById: originalTasksById,
              taskIdsByColumn: originalTaskIdsByCol,
            });
            notification.error('Failed to move task');
          }
        },

        async getCommentsForTask(taskId: string) {
          try {
            const res = await firstValueFrom(api.getCommentsForTask(taskId));
            const rawComments = Array.isArray(res) ? res : [];
            patchState(store, {
              comments: rawComments.map((c: any) => ({ ...c, id: c._id ?? c.id })),
            });
          } catch (err) {
            notification.error('Failed to fetch comments');
          }
        },

        async postCommentToTask(taskId: string, content: string) {
          try {
            const res: any = await firstValueFrom(api.postCommentToTask(taskId, content));
            let rawNewComment = res.data || res;
            if (Array.isArray(rawNewComment)) rawNewComment = rawNewComment[0];

            const newComment = { ...rawNewComment, id: rawNewComment._id ?? rawNewComment.id };
            patchState(store, { comments: [newComment, ...store.comments()] });
          } catch (err) {
            notification.error('Failed to post comment');
          }
        },

        async deleteComment(commentId: string) {
          if (!commentId?.trim()) return;

          const currentComments = store.comments();
          patchState(store, { comments: currentComments.filter((c) => c.id !== commentId) });

          try {
            await firstValueFrom(api.deleteComment(commentId));
            notification.success('Comment deleted successfully');
          } catch (err) {
            patchState(store, { comments: currentComments });
            notification.error('Failed to delete comment');
          }
        },
      };
    },
  ),
);
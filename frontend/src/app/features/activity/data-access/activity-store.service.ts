import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ActivityApiService } from './activity-api.service';
import { ActivityItem, ActivityRef, formatActivityAction } from '../models/activity.model';

const asRef = (value: string | ActivityRef | null | undefined): ActivityRef | null => {
  if (!value || typeof value === 'string') return null;
  return value;
};

const asText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const getRefId = (value: string | ActivityRef | null | undefined): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.id ?? value._id ?? null;
};

const toSlug = (value: string): string => {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
};

const sanitizeColumnText = (value: string | null): string | null => {
  if (!value) return null;
  return /^[a-f\d]{24}$/i.test(value) ? null : value;
};

const FIELD_MAP: Record<string, string> = {
  assigneeIds: 'assignees',
  assignedAt: 'assignment date',
  title: 'title',
  description: 'description',
  dueDate: 'due date',
  startDate: 'start date',
  priority: 'priority',
  labels: 'labels',
  checklist: 'checklist items',
  status: 'status',
  visibility: 'visibility'
};

const humanizeField = (field: string): string => {
  if (FIELD_MAP[field]) return FIELD_MAP[field];
  return field.replace(/([A-Z])/g, ' $1').toLowerCase();
};


export const getActorName = (item: ActivityItem | any): string => {
  return asRef(item.userId)?.name || 'Someone';
};

export const getActionText = (item: ActivityItem): string => {
  const metadata = item.metadata ?? {};
  const boardName = asRef(item.boardId)?.name;
  const taskTitle = asRef(item.taskId)?.title;
  const columnName = asRef(item.columnId)?.name;
  const wsName = asText(metadata['workspaceName']);

  switch (item.actionType) {
    case 'task_created':
      return `added ${taskTitle} to ${columnName || 'list'}`;
    case 'task_moved':
      const source = sanitizeColumnText(asText(metadata['sourceColumnName'])) || 'another list';
      const dest = sanitizeColumnText(asText(metadata['destinationColumnName'])) || (columnName || 'a list');
      return `moved ${taskTitle} from ${source} to ${dest}`;
    case 'task_completed':
      return `marked ${taskTitle} complete`;
    case 'task_reopened':
      return `marked ${taskTitle} incomplete`;
    case 'task_archived':
      return `archived ${taskTitle}`;
    case 'task_restored':
      return `sent ${taskTitle} to the board`;
    case 'task_updated':
      if (metadata['updatedFields']) {
        const fields = Array.isArray(metadata['updatedFields']) ? metadata['updatedFields'] : [];
        if (fields.includes('dueDate')) return `changed the due date of ${taskTitle}`;
        if (fields.includes('assigneeIds')) return `updated the assignees on ${taskTitle}`;
      }
      return `updated ${taskTitle}`;
    case 'comment_created':
      return `commented on ${taskTitle}`;
    case 'board_created':
      return wsName ? `added ${boardName} to ${wsName}` : `created ${boardName}`;
    case 'column_created':
      return `added list ${columnName} to ${boardName || 'board'}`;
    case 'column_archived':
      return `archived list ${columnName}`;
    case 'workspace_created':
      return `created ${wsName}`;
    default:
      const fallbackAction = formatActivityAction(item.actionType);
      return `${fallbackAction} ${taskTitle || columnName || boardName || wsName || 'an item'}`;
  }
};

export const getLocationTags = (item: ActivityItem): string[] => {
  const tags: string[] = [];
  const boardName = asRef(item.boardId)?.name;
  const wsName = asText(item.metadata?.['workspaceName']);

  if (boardName) {
    tags.push(`on board ${boardName}`);
  }
  if (wsName && (item.entityType === 'board' || item.entityType === 'workspace')) {
    tags.push(`on Workspace ${wsName}`);
  }
  
  return tags;
};

const generateDeepLink = (item: ActivityItem, workspaceId?: string) => {
  const boardId = getRefId(item.boardId);
  const taskId = getRefId(item.taskId);
  const resolvedWorkspaceId = workspaceId || asText(item.workspaceId) || undefined;
  const boardName = asRef(item.boardId)?.name;
  const taskTitle = asRef(item.taskId)?.title;
  const workspaceName = asText(item.metadata?.['workspaceName']) || 'workspace';

  if (item.entityType === 'workspace') {
    return {
      commands: resolvedWorkspaceId
        ? ['/workspaces', resolvedWorkspaceId, toSlug(workspaceName)]
        : ['/workspaces'],
      label: 'Open workspace',
    };
  }

  if (boardId) {
    const queryParams: Record<string, string> = {};
    if (resolvedWorkspaceId) queryParams['workspaceId'] = resolvedWorkspaceId;
    if (taskId) queryParams['taskId'] = taskId;
    if (taskTitle) queryParams['taskTitle'] = toSlug(taskTitle);

    return {
      commands: ['/boards', boardId, toSlug(boardName || 'board')],
      queryParams: Object.keys(queryParams).length ? queryParams : undefined,
      label: taskId ? 'Open task' : 'Open board',
    };
  }

  if (resolvedWorkspaceId) {
    return {
      commands: ['/activity'],
      queryParams: { workspaceId: resolvedWorkspaceId },
      label: 'Open activity context',
    };
  }

  return null;
};

type ActivityState = {
  loading: boolean;
  error: string | null;
  items: ActivityItem[];
  workspaceId: string | undefined;
  boardId: string | undefined;
  taskId: string | undefined;
  isLoaded: boolean;
};

const initialState: ActivityState = {
  loading: true,
  error: null,
  items: [],
  workspaceId: undefined,
  boardId: undefined,
  taskId: undefined,
  isLoaded: false,
};

export const ActivityStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, workspaceId, boardId, taskId, loading, error }) => ({
    isLoading: computed(() => loading()),
    hasError: computed(() => error()),
    currentWorkspaceId: computed(() => workspaceId()),
    currentBoardId: computed(() => boardId()),
    currentTaskId: computed(() => taskId()),
    uiItems: computed(() => {
      const wId = workspaceId();
      return items().map((item) => ({
        id: item._id ?? item.id ?? item.createdAt,
        actor: getActorName(item),
        actionText: getActionText(item),
        isComment: item.actionType === 'comment_created',
        commentContent: item.metadata?.['contentPreview'],
        locationTags: getLocationTags(item),
        deepLink: generateDeepLink(item, wId),
        createdAt: item.createdAt,
      }));
    }),
  })),
  withMethods((store, activityApi = inject(ActivityApiService)) => {
    const fetchActivities = async (
      request$: any, 
      statePatches: Partial<ActivityState>
    ) => {
      patchState(store, { loading: true, error: null, isLoaded: false, ...statePatches });
      try {
        const response = await firstValueFrom(request$) as { data?: { items?: any[] } };
        patchState(store, { items: response.data?.items ?? [], loading: false, isLoaded: true });
      } catch (err) {
        patchState(store, {
          error: 'Failed to load activity feed',
          items: [],
          loading: false,
          isLoaded: false,
        });
      }
    };

    return {
      async loadUserActivity(userId: string, forceRefresh = false) {
        if (!forceRefresh && store.isLoaded() && !store.workspaceId() && !store.boardId() && !store.taskId()) {
          return;
        }
        await fetchActivities(activityApi.getUserActivity(userId), { 
          workspaceId: undefined, 
          boardId: undefined, 
          taskId: undefined 
        });
      },

      async loadWorkspaceActivity(workspaceId?: string, forceRefresh = false) {
        if (!forceRefresh && store.isLoaded() && store.workspaceId() === workspaceId && !store.boardId() && !store.taskId()) {
          return;
        }
        await fetchActivities(activityApi.getWorkspaceActivity(workspaceId), { 
          workspaceId, 
          boardId: undefined, 
          taskId: undefined 
        });
      },

      async loadBoardActivity(workspaceId: string, boardId: string, forceRefresh = false) {
        if (!forceRefresh && store.isLoaded() && store.workspaceId() === workspaceId && store.boardId() === boardId && !store.taskId()) {
          return;
        }
        await fetchActivities(activityApi.getBoardActivity(workspaceId, boardId), { 
          workspaceId, 
          boardId, 
          taskId: undefined 
        });
      },

      async loadTaskActivity(taskId: string, forceRefresh = false) {
        if (!forceRefresh && store.isLoaded() && store.taskId() === taskId) {
          return;
        }
        await fetchActivities(activityApi.getTaskActivity(taskId), { 
          workspaceId: undefined, 
          boardId: undefined, 
          taskId 
        });
      },
    };
  }),
);

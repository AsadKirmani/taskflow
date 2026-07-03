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
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
};

const sanitizeColumnText = (value: string | null): string | null => {
  if (!value) return null;
  return /^[a-f\d]{24}$/i.test(value) ? null : value;
};

const getActorName = (item: ActivityItem): string => {
  return asRef(item.userId)?.name || 'Someone';
};

const formatDescription = (item: ActivityItem): string => {
  const actor = getActorName(item);
  const action = formatActivityAction(item.actionType);
  
  const boardName = asRef(item.boardId)?.name;
  const taskTitle = asRef(item.taskId)?.title;
  const columnName = asRef(item.columnId)?.name;
  
  let target = '';
  let location = '';

  if (item.entityType === 'task') {
    target = taskTitle ? `task "${taskTitle}"` : 'a task';
    if (boardName) location = `in "${boardName}"`;
  } 
  else if (item.entityType === 'comment') {
    target = taskTitle ? `"${taskTitle}"` : 'a comment';
    if (boardName) location = `in "${boardName}"`;
  } 
  else if (item.entityType === 'column') {
    target = columnName ? `column "${columnName}"` : 'a column';
    if (boardName) location = `in "${boardName}"`;
  } 
  else if (item.entityType === 'board') {
    target = boardName ? `board "${boardName}"` : 'a board';
  } 
  else {
    const wsName = asText(item.metadata?.['workspaceName']);
    target = wsName ? `workspace "${wsName}"` : 'the workspace';
  }

  const sentence = [actor, action, target, location].filter(Boolean).join(' ');
  return sentence;
};

const formatContext = (item: ActivityItem): string => {
  const metadata = item.metadata ?? {};
  const sourceRaw = asText(metadata['sourceColumnName']) ?? asText(metadata['sourceColumnId']);
  const destinationRaw = asText(metadata['destinationColumnName']) ?? asText(metadata['destinationColumnId']);
  const source = sanitizeColumnText(sourceRaw);
  const destination = sanitizeColumnText(destinationRaw);

  const details: string[] = [];
  
  if (source && destination) {
    details.push(`Moved from ${source} to ${destination}`);
  } else if (item.actionType === 'task_moved') {
    details.push('Moved between columns');
  }

  const updatedFields = Array.isArray(metadata['updatedFields'])
    ? (metadata['updatedFields'] as unknown[]).map(field => String(field)).filter(Boolean)
    : [];

  if (updatedFields.length && item.actionType !== 'task_completed' && item.actionType !== 'task_reopened') {
    details.push(`Updated: ${updatedFields.join(', ')}`);
  }

  return details.join(' • '); 
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
      commands: resolvedWorkspaceId ? ['/workspaces', resolvedWorkspaceId, toSlug(workspaceName)] : ['/workspaces'],
      label: 'Open workspace'
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
      label: taskId ? 'Open task' : 'Open board'
    };
  }

  if (resolvedWorkspaceId) {
    return {
      commands: ['/activity'],
      queryParams: { workspaceId: resolvedWorkspaceId },
      label: 'Open activity context'
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
  isLoaded: boolean;
};

const initialState: ActivityState = {
  loading: true,
  error: null,
  items: [],
  workspaceId: undefined,
  boardId: undefined,
  isLoaded: false
};

export const ActivityStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, workspaceId, loading, error, boardId }) => ({
    isLoading: computed(() => loading()),
    hasError: computed(() => error()),
    currentWorkspaceId: computed(() => workspaceId()),
    currentBoardId: computed(() => boardId()),
    uiItems: computed(() => {
      const wId = workspaceId();
      return items().map(item => ({
        id: item._id ?? item.id ?? item.createdAt,
        description: formatDescription(item),
        context: formatContext(item),
        deepLink: generateDeepLink(item, wId),
        createdAt: item.createdAt
      }));
    })
  })),
  withMethods((store, activityApi = inject(ActivityApiService)) => ({
    
    async loadActivities(workspaceId?: string, boardId?: string, forceRefresh = false) {
      
      // 🚀 THE FIX: Cache Check
      // Agar data loaded hai aur IDs same hain jo maangi ja rahi hain, toh API call skip kar do!
      if (!forceRefresh && store.isLoaded() && !store.error() && store.currentWorkspaceId() === workspaceId && store.currentBoardId() === boardId) {
        return; 
      }

      // Naya data mangwana hai toh isLoaded ko pehle false karo
      patchState(store, { loading: true, error: null, workspaceId, boardId, isLoaded: false });

      try {
        let request$;
        if (boardId && workspaceId) {
          request$ = activityApi.getBoardActivity(workspaceId, boardId);
        } else if (workspaceId) {
          request$ = activityApi.getWorkspaceActivity(workspaceId);
        } else {
          request$ = activityApi.getGlobalActivity();
        }

        const response = await firstValueFrom(request$);
        patchState(store, { items: response.data?.items ?? [], loading: false, isLoaded: true });
      } catch (err) {
        patchState(store, { error: 'Failed to load activity feed', items: [], loading: false, isLoaded: false });
      }
    }
    
  }))
);
import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { ActivityApiService } from '../../data-access/activity-api.service';
import { WorkspaceStoreService } from '../../../workspace/data-access/workspace-store.service';
import { ActivityItem, ActivityRef } from '../../models/activity.model';

@Component({
  selector: 'app-activity-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, RouterLink],
  template: `
    @if (vm$ | async; as vm) {
      <section class="h-full min-h-0 p-3 sm:p-4 bg-gray-50 rounded-xl flex flex-col gap-3">
        <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-3 sm:p-4 shadow-sm">
          <div class="min-w-0">
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900">Activity</h1>
            <p class="text-sm text-gray-500">
              @if (vm.boardId) {
                Board activity feed
              } @else {
                Workspace activity feed
              }
            </p>
          </div>
          @if (vm.workspaceId) {
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded break-all self-start sm:self-auto">
              Workspace: {{ vm.workspaceId }}
            </span>
          }
        </header>

        <div class="flex-1 min-h-0 overflow-auto rounded-xl bg-white p-3 shadow-sm">
          @if (vm.loading) {
            <p class="text-sm text-gray-500">Loading activity...</p>
          } @else if (vm.error) {
            <p class="text-sm text-red-600">{{ vm.error }}</p>
          } @else if (vm.items.length === 0) {
            <p class="text-sm text-gray-500">No activity yet.</p>
          } @else {
            <ul class="space-y-2">
              @for (item of vm.items; track item._id ?? item.id ?? item.createdAt) {
                <li class="rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-900">{{ describeActivity(item) }}</p>
                      <p class="text-xs text-gray-500">{{ describeContext(item) }}</p>
                      @if (getDeepLink(item, vm.workspaceId); as deepLink) {
                        @if (deepLink.commands) {
                          <a
                            class="mt-1 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            [routerLink]="deepLink.commands"
                            [queryParams]="deepLink.queryParams"
                          >
                            {{ deepLink.label }}
                          </a>
                        }
                      }
                    </div>
                    <span class="text-xs text-gray-400 shrink-0">{{ item.createdAt | date:'medium' }}</span>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityPageComponent {
  private readonly activityApi = inject(ActivityApiService);
  private readonly workspaceStore = inject(WorkspaceStoreService);
  private readonly route = inject(ActivatedRoute);

  readonly vm$ = combineLatest([
    this.workspaceStore.state$,
    this.route.queryParamMap
  ]).pipe(
    map(([workspaceState, query]) => {
      let workspaceId = query.get('workspaceId') ?? undefined;
      const boardId = query.get('boardId') ?? undefined;

      if (!workspaceId) {
        if (!workspaceState.workspaces.length && !workspaceState.loading && !workspaceState.loaded) {
          this.workspaceStore.loadWorkspaces();
        }

        workspaceId = workspaceState.workspaces[0]?.id;
      }

      return {
        workspaceState,
        workspaceId,
        boardId
      };
    }),
    distinctUntilChanged((previous, current) => {
      if (!previous.workspaceId && !current.workspaceId) {
        return (
          previous.workspaceState.loading === current.workspaceState.loading &&
          previous.workspaceState.error === current.workspaceState.error &&
          previous.workspaceState.workspaces.length === current.workspaceState.workspaces.length
        );
      }

      return previous.workspaceId === current.workspaceId && previous.boardId === current.boardId;
    }),
    switchMap(({ workspaceState, workspaceId, boardId }) => {

      if (!workspaceId) {
        return of({
          loading: workspaceState.loading,
          error: workspaceState.error,
          items: [] as ActivityItem[],
          workspaceId: undefined,
          boardId
        });
      }

      const request$ = boardId
        ? this.activityApi.getBoardActivity(workspaceId, boardId)
        : this.activityApi.getWorkspaceActivity(workspaceId);

      return request$.pipe(
        map(response => ({
          loading: false,
          error: null,
          items: response.data?.items ?? [],
          workspaceId,
          boardId
        })),
        catchError(() =>
          of({
            loading: false,
            error: 'Failed to load activity',
            items: [] as ActivityItem[],
            workspaceId,
            boardId
          })
        )
      );
    })
  );

  formatAction(action: string): string {
    return action
      .split('_')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  describeActivity(item: ActivityItem): string {
    const actor = this.getActorName(item);
    const action = this.getActionPhrase(item.actionType);
    const target = this.getTargetText(item);

    if (target) {
      return `${actor} ${action} ${target}.`;
    }

    return `${actor} ${action}.`;
  }

  describeContext(item: ActivityItem): string {
    const metadata = item.metadata ?? {};
    const sourceRaw = this.asText(metadata['sourceColumnName']) ?? this.asText(metadata['sourceColumnId']);
    const destinationRaw = this.asText(metadata['destinationColumnName']) ?? this.asText(metadata['destinationColumnId']);
    const source = this.sanitizeColumnText(sourceRaw);
    const destination = this.sanitizeColumnText(destinationRaw);
    const position = this.asText(metadata['position']);

    const details: string[] = [];

    if (source && destination) {
      details.push(`Moved from ${source} to ${destination}`);
    } else if (item.actionType === 'task_moved') {
      details.push('Moved between columns');
    }

    if (position) {
      details.push(`at position ${position}`);
    }

    const updatedFields = Array.isArray(metadata['updatedFields'])
      ? (metadata['updatedFields'] as unknown[]).map(field => String(field)).filter(Boolean)
      : [];

    if (updatedFields.length && item.actionType !== 'task_completed' && item.actionType !== 'task_reopened') {
      details.push(`Updated: ${updatedFields.join(', ')}`);
    }

    if (details.length === 0) {
      const entity = this.getEntityLabel(item);
      return entity ? `Entity: ${entity}` : `Entity ID: ${item.entityId}`;
    }

    return details.join(' | ');
  }

  private getActorName(item: ActivityItem): string {
    const actor = this.asRef(item.userId);
    return actor?.name || 'Someone';
  }

  private getActionPhrase(actionType: string): string {
    const actionMap: Record<string, string> = {
      workspace_created: 'created',
      workspace_updated: 'updated',
      workspace_member_invited: 'invited a member to',
      board_created: 'created',
      board_updated: 'updated',
      board_archived: 'archived',
      board_restored: 'restored',
      column_created: 'created',
      column_updated: 'updated',
      column_archived: 'archived',
      column_restored: 'restored',
      task_created: 'created',
      task_updated: 'updated',
      task_completed: 'completed',
      task_reopened: 'reopened',
      task_moved: 'moved',
      task_archived: 'archived',
      task_restored: 'restored',
      comment_created: 'commented on',
      comment_updated: 'edited a comment on'
    };

    return actionMap[actionType] ?? this.formatAction(actionType).toLowerCase();
  }

  private getTargetText(item: ActivityItem): string {
    const task = this.asRef(item.taskId);
    if (task?.title) {
      return `task "${task.title}"`;
    }

    const entity = this.getEntityLabel(item);
    return entity || '';
  }

  private getEntityLabel(item: ActivityItem): string {
    const board = this.asRef(item.boardId);
    const column = this.asRef(item.columnId);

    if (item.entityType === 'board') {
      return board?.name ? `board "${board.name}"` : 'a board';
    }

    if (item.entityType === 'column') {
      return column?.name ? `column "${column.name}"` : 'a column';
    }

    if (item.entityType === 'task') {
      const task = this.asRef(item.taskId);
      return task?.title ? `task "${task.title}"` : 'a task';
    }

    if (item.entityType === 'comment') {
      const task = this.asRef(item.taskId);
      return task?.title ? `comment on task "${task.title}"` : 'a comment';
    }

    return 'workspace';
  }

  private asRef(value: string | ActivityRef | null | undefined): ActivityRef | null {
    if (!value || typeof value === 'string') {
      return null;
    }

    return value;
  }

  private asText(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    return String(value);
  }

  private sanitizeColumnText(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const looksLikeObjectId = /^[a-f\d]{24}$/i.test(value);
    return looksLikeObjectId ? null : value;
  }

  getDeepLink(item: ActivityItem, workspaceId?: string): {
    commands: string[] | null;
    queryParams?: Record<string, string>;
    label: string;
  } {
    const boardId = this.getRefId(item.boardId);
    const taskId = this.getRefId(item.taskId);
    const resolvedWorkspaceId = workspaceId || this.asText(item.workspaceId) || undefined;
    const boardName = this.asRef(item.boardId)?.name;
    const taskTitle = this.asRef(item.taskId)?.title;
    const workspaceName = this.asText(item.metadata?.['workspaceName']) || 'workspace';

    if (item.entityType === 'workspace') {
      return {
        commands: resolvedWorkspaceId
          ? ['/workspaces', resolvedWorkspaceId, this.toSlug(workspaceName)]
          : ['/workspaces'],
        queryParams: undefined,
        label: 'Open workspace'
      };
    }

    if (boardId) {
      const queryParams: Record<string, string> = {};
      if (resolvedWorkspaceId) {
        queryParams['workspaceId'] = resolvedWorkspaceId;
      }
      if (taskId) {
        queryParams['taskId'] = taskId;
      }
      if (taskTitle) {
        queryParams['taskTitle'] = this.toSlug(taskTitle);
      }

      return {
        commands: ['/boards', boardId, this.toSlug(boardName || 'board')],
        queryParams: Object.keys(queryParams).length ? queryParams : undefined,
        label: taskId ? 'Open task in board' : 'Open board'
      };
    }

    if (resolvedWorkspaceId) {
      return {
        commands: ['/activity'],
        queryParams: { workspaceId: resolvedWorkspaceId },
        label: 'Open activity context'
      };
    }

    return {
      commands: null,
      label: ''
    };
  }

  private getRefId(value: string | ActivityRef | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    return value.id ?? value._id ?? null;
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  }
}
import { ActivityLogModel } from '../../models/activity-log.model';
import { ColumnModel } from '../../models/column.model';

const applyActivityPopulation = <T>(query: T & {
  populate: (args: Array<{ path: string; select: string }>) => T;
}) =>
  query.populate([
    { path: 'userId', select: 'name email avatarUrl' },
    { path: 'taskId', select: 'title columnId boardId' },
    { path: 'boardId', select: 'name workspaceId' },
    { path: 'columnId', select: 'name boardId' }
  ]);

export const activityRepository = {
  async logActivity(data: {
    workspaceId: string;
    userId: string;
    actionType: string;
    entityType: 'workspace' | 'board' | 'column' | 'task' | 'comment';
    entityId: string;
    boardId?: string;
    columnId?: string;
    taskId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return ActivityLogModel.create({
      workspaceId: data.workspaceId,
      boardId: data.boardId ?? null,
      columnId: data.columnId ?? null,
      taskId: data.taskId ?? null,
      userId: data.userId,
      actionType: data.actionType,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ?? {}
    });
  },
  async getGlobalActivity(workspaceIds: string[], page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query = { workspaceId: { $in: workspaceIds } };

    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ),
      ActivityLogModel.countDocuments(query)
    ]);

    const enrichedItems = await enrichMoveColumnNames(items as Array<Record<string, unknown>>);
    return { items: enrichedItems, total };
  },

  async getWorkspaceActivity(workspaceId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find({ workspaceId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ),
      ActivityLogModel.countDocuments({ workspaceId })
    ]);

    const enrichedItems = await enrichMoveColumnNames(items as Array<Record<string, unknown>>);
    return { items: enrichedItems, total };
  },

  async getBoardActivity(workspaceId: string, boardId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query = { workspaceId, boardId };

    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ),
      ActivityLogModel.countDocuments(query)
    ]);

    const enrichedItems = await enrichMoveColumnNames(items as Array<Record<string, unknown>>);
    return { items: enrichedItems, total };
  },

  async getTaskActivity(taskId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query = { taskId };

    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ),
      ActivityLogModel.countDocuments(query)
    ]);

    const enrichedItems = await enrichMoveColumnNames(items as Array<Record<string, unknown>>);
    return { items: enrichedItems, total };
  }
};

const enrichMoveColumnNames = async (items: Array<Record<string, unknown>>) => {
  const columnIds = new Set<string>();

  for (const item of items) {
    const actionType = String(item['actionType'] ?? '');
    const metadata = (item['metadata'] ?? {}) as Record<string, unknown>;

    if (actionType !== 'task_moved') {
      continue;
    }

    const sourceId = typeof metadata['sourceColumnId'] === 'string' ? metadata['sourceColumnId'] : null;
    const destinationId = typeof metadata['destinationColumnId'] === 'string' ? metadata['destinationColumnId'] : null;

    if (sourceId) {
      columnIds.add(sourceId);
    }

    if (destinationId) {
      columnIds.add(destinationId);
    }
  }

  if (columnIds.size === 0) {
    return items;
  }

  const columns = await ColumnModel.find({ _id: { $in: [...columnIds] } }).select('_id name');
  const columnNameById = new Map(columns.map(column => [column._id.toString(), column.name]));

  for (const item of items) {
    const actionType = String(item['actionType'] ?? '');
    const metadata = (item['metadata'] ?? {}) as Record<string, unknown>;

    if (actionType !== 'task_moved') {
      continue;
    }

    const sourceId = typeof metadata['sourceColumnId'] === 'string' ? metadata['sourceColumnId'] : null;
    const destinationId = typeof metadata['destinationColumnId'] === 'string' ? metadata['destinationColumnId'] : null;

    if (!metadata['sourceColumnName'] && sourceId && columnNameById.has(sourceId)) {
      metadata['sourceColumnName'] = columnNameById.get(sourceId);
    }

    if (!metadata['destinationColumnName'] && destinationId && columnNameById.has(destinationId)) {
      metadata['destinationColumnName'] = columnNameById.get(destinationId);
    }

    item['metadata'] = metadata;
  }

  return items;
};

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

  async getGlobalActivity(
    workspaceIds: string[],
    page: number,
    limit: number
  ) {

    const skip = (page - 1) * limit;

    const query = {
      workspaceId: {
        $in: workspaceIds
      }
    };

    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ),

      ActivityLogModel.countDocuments(query)
    ]);

    return {
      items: await enrichMoveColumnNames(items),
      total
    };
  },

  async getWorkspaceActivity(
    workspaceId: string,
    page: number,
    limit: number
  ) {

    const skip = (page - 1) * limit;

    const query = {
      workspaceId
    };

    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ),

      ActivityLogModel.countDocuments(query)
    ]);

    return {
      items: await enrichMoveColumnNames(items),
      total
    };
  },

  async getBoardActivity(
    workspaceId: string,
    boardId: string,
    page: number,
    limit: number
  ) {

    const skip = (page - 1) * limit;

    const query = {
      workspaceId,
      boardId
    };

    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ),

      ActivityLogModel.countDocuments(query)
    ]);

    return {
      items: await enrichMoveColumnNames(items),
      total
    };
  },

  async getTaskActivity(
    taskId: string,
    page: number,
    limit: number
  ) {

    const skip = (page - 1) * limit;

    const query = {
      taskId
    };

    const [items, total] = await Promise.all([
      applyActivityPopulation(
        ActivityLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ),

      ActivityLogModel.countDocuments(query)
    ]);

    return {
      items: await enrichMoveColumnNames(items),
      total
    };
  }
};

async function enrichMoveColumnNames(
  items: Array<Record<string, unknown>>
) {

  const columnIds = new Set<string>();

  for (const item of items) {

    if (item.actionType !== 'task_moved') {
      continue;
    }

    const metadata =
      (item.metadata ?? {}) as Record<string, unknown>;

    const sourceColumnId =
      metadata.sourceColumnId as string | undefined;

    const destinationColumnId =
      metadata.destinationColumnId as string | undefined;

    if (sourceColumnId) {
      columnIds.add(sourceColumnId);
    }

    if (destinationColumnId) {
      columnIds.add(destinationColumnId);
    }
  }

  if (!columnIds.size) {
    return items;
  }

  const columns = await ColumnModel.find({
    _id: {
      $in: [...columnIds]
    }
  })
    .select('_id name')
    .lean();

  const columnMap = new Map(
    columns.map(column => [
      column._id.toString(),
      column.name
    ])
  );

  for (const item of items) {

    if (item.actionType !== 'task_moved') {
      continue;
    }

    const metadata =
      (item.metadata ?? {}) as Record<string, unknown>;

    const sourceColumnId =
      metadata.sourceColumnId as string | undefined;

    const destinationColumnId =
      metadata.destinationColumnId as string | undefined;

    if (
      sourceColumnId &&
      !metadata.sourceColumnName
    ) {
      metadata.sourceColumnName =
        columnMap.get(sourceColumnId);
    }

    if (
      destinationColumnId &&
      !metadata.destinationColumnName
    ) {
      metadata.destinationColumnName =
        columnMap.get(destinationColumnId);
    }

    item.metadata = metadata;
  }

  return items;
}
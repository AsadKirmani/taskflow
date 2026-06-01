import { ColumnModel } from "../../models/column.model";
import { TaskModel } from "../../models/task.model";
import { Types } from "mongoose";

export const taskRepository = {
  async createTask(data: {
    title: string;
    description?: string;
    columnId: string;
    boardId: string;
    workspaceId: string;
    reporterId: string;
    position?: number;
  }) {
    const newTask = await TaskModel.create(data);
    await ColumnModel.findByIdAndUpdate(data.columnId, {
      $push: { taskOrder: newTask._id },
    });
    return newTask;
  },
  async getTasksInBoard(boardId: string) {
    const tasks = await TaskModel.find({ boardId });
    return tasks;
  },
  async getTaskById(taskId: string) {
    const task = await TaskModel.findById(taskId);
    return task;
  },
  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      isCompleted?: boolean;
      completedAt?: Date | null;
      commentCount?: number;
    },
  ) {
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, data, { new: true });
    return updatedTask;
  },
  async moveTask(
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    position: number,
  ) {
    const getEffectiveTaskOrder = async (columnId: string, fallbackTaskOrder: unknown[]): Promise<string[]> => {
      const fromColumnOrder = (fallbackTaskOrder ?? [])
        .map(id => String(id))
        .filter(Boolean);

      if (fromColumnOrder.length > 0) {
        return fromColumnOrder;
      }

      const tasks = await TaskModel.find({ columnId })
        .sort({ position: 1, createdAt: 1 })
        .select('_id');

      return tasks.map(task => String(task._id));
    };

    const sourceColumn = await ColumnModel.findById(sourceColumnId);
    if (!sourceColumn) return;

    const destinationColumn =
      sourceColumnId === destinationColumnId
        ? sourceColumn
        : await ColumnModel.findById(destinationColumnId);
    if (!destinationColumn) return;

    const movedTaskId = String(taskId);

    const sourceEffectiveOrder = await getEffectiveTaskOrder(
      sourceColumnId,
      sourceColumn.taskOrder as unknown[]
    );
    const destinationEffectiveOrder =
      sourceColumnId === destinationColumnId
        ? sourceEffectiveOrder
        : await getEffectiveTaskOrder(
            destinationColumnId,
            destinationColumn.taskOrder as unknown[]
          );

    const sourceTaskOrder = sourceEffectiveOrder
      .filter(id => id !== movedTaskId);

    const destinationTaskOrder =
      sourceColumnId === destinationColumnId
        ? sourceTaskOrder
        : destinationEffectiveOrder.filter(id => id !== movedTaskId);

    const clampedPosition = Math.max(0, Math.min(position, destinationTaskOrder.length));
    destinationTaskOrder.splice(clampedPosition, 0, movedTaskId);

    if (sourceColumnId === destinationColumnId) {
      await ColumnModel.findByIdAndUpdate(sourceColumnId, {
        $set: { taskOrder: destinationTaskOrder },
      });
    } else {
      await ColumnModel.findByIdAndUpdate(sourceColumnId, {
        $set: { taskOrder: sourceTaskOrder },
      });
      await ColumnModel.findByIdAndUpdate(destinationColumnId, {
        $set: { taskOrder: destinationTaskOrder },
      });
    }

    const destinationColumnObjectId = new Types.ObjectId(destinationColumnId);
    const sourceColumnObjectId = new Types.ObjectId(sourceColumnId);

    const updates: Array<{
      updateOne: {
        filter: { _id: Types.ObjectId };
        update: { $set: { columnId: Types.ObjectId; position: number } };
      };
    }> = [];

    for (const [index, id] of destinationTaskOrder.entries()) {
      updates.push({
        updateOne: {
          filter: { _id: new Types.ObjectId(id) },
          update: { $set: { columnId: destinationColumnObjectId, position: index } },
        },
      });
    }

    if (sourceColumnId !== destinationColumnId) {
      for (const [index, id] of sourceTaskOrder.entries()) {
        updates.push({
          updateOne: {
            filter: { _id: new Types.ObjectId(id) },
            update: { $set: { columnId: sourceColumnObjectId, position: index } },
          },
        });
      }
    }

    if (updates.length > 0) {
      await TaskModel.bulkWrite(updates);
    }
  },
};
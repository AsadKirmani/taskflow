import { ColumnModel } from "../../models/column.model";
import { TaskModel } from "../../models/task.model";
import { Types } from "mongoose";
import { TaskFilters } from "./task.service";

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
    if (data.position === undefined) {
      const column = await ColumnModel.findById(data.columnId).select(
        "taskOrder",
      );
      data.position = column?.taskOrder?.length || 0;
    }
    const newTask = await TaskModel.create(data);
    await ColumnModel.findByIdAndUpdate(data.columnId, {
      $push: { taskOrder: newTask._id },
    });
    return newTask;
  },

  async getTasksInBoard(boardId: string, filters?: TaskFilters) {
    const query = this.buildTaskQuery(boardId, filters);

    const tasks = await TaskModel.find({ ...query, archived: false }).sort({
      position: 1,
      createdAt: 1,
    });
    return tasks;
  },
  buildTaskQuery(
    boardId: string,
    filters?: TaskFilters,
  ): Record<string, unknown> {
    const andConditions: Record<string, unknown>[] = [];
    const now = new Date();

    if (!filters) {
      return { boardId };
    }

    if (filters.search) {
      andConditions.push({
        $or: [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
        ],
      });
    }

    if (filters.priorities?.length) {
      andConditions.push({ priority: { $in: filters.priorities } });
    }

    if (filters.assigneeIds?.length) {
      andConditions.push({ assigneeIds: { $in: filters.assigneeIds } });
    }

    if (filters.memberScope === "no_members") {
      andConditions.push({ assigneeIds: { $size: 0 } });
    }

    if (filters.memberScope === "me" && filters.currentUserId) {
      andConditions.push({ assigneeIds: filters.currentUserId });
    }

    if (filters.completion === "completed") {
      andConditions.push({ isCompleted: true });
    }

    if (filters.completion === "incomplete") {
      andConditions.push({ isCompleted: false });
    }

    if (filters.dueType === "none") {
      andConditions.push({ dueDate: null });
    }

    if (filters.dueType === "overdue") {
      andConditions.push({ dueDate: { $lt: now } });
    }

    if (filters.dueType === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      andConditions.push({ dueDate: { $gte: start, $lt: end } });
    }

    if (filters.dueType === "this_week") {
      const start = new Date(now);
      const day = start.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      andConditions.push({ dueDate: { $gte: start, $lt: end } });
    }

    if (filters.labels?.length) {
      const labelConditions = filters.labels.map((label) => {
        if (label === "no_color") {
          return { labels: { $size: 0 } };
        }
        return {
          $or: [
            { labels: { $elemMatch: { name: new RegExp(`^${label}$`, "i") } } },
            { labels: { $elemMatch: { color: new RegExp(label, "i") } } },
          ],
        };
      });
      andConditions.push({ $or: labelConditions });
    }

    if (filters.activity?.length) {
      const activityConditions: Record<string, unknown>[] = [];

      for (const type of filters.activity) {
        if (type === "recentlyupdated") {
          const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          activityConditions.push({ updatedAt: { $gte: since } });
        }

        if (type === "recentlycreated") {
          const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          activityConditions.push({ createdAt: { $gte: since } });
        }

        if (type === "activeinlastweek") {
          const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          activityConditions.push({ updatedAt: { $gte: since } });
          activityConditions.push({ createdAt: { $gte: since } });
        }

        if (type === "activeinlastmonth") {
          const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          activityConditions.push({ updatedAt: { $gte: since } });
          activityConditions.push({ createdAt: { $gte: since } });
        }
      }

      if (activityConditions.length) {
        andConditions.push({ $or: activityConditions });
      }
    }

    return andConditions.length
      ? { boardId, $and: andConditions }
      : { boardId };
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
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, data, {
      returnDocument: "after",
    });
    return updatedTask;
  },
  async moveTask(
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    position: number,
  ) {
    const getEffectiveTaskOrder = async (
      columnId: string,
      fallbackTaskOrder: unknown[],
    ): Promise<string[]> => {
      const fromColumnOrder = (fallbackTaskOrder ?? [])
        .map((id) => String(id))
        .filter(Boolean);

      if (fromColumnOrder.length > 0) {
        return fromColumnOrder;
      }

      const tasks = await TaskModel.find({ columnId })
        .sort({ position: 1, createdAt: 1 })
        .select("_id");

      return tasks.map((task) => String(task._id));
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
      sourceColumn.taskOrder as unknown[],
    );
    const destinationEffectiveOrder =
      sourceColumnId === destinationColumnId
        ? sourceEffectiveOrder
        : await getEffectiveTaskOrder(
            destinationColumnId,
            destinationColumn.taskOrder as unknown[],
          );

    const sourceTaskOrder = sourceEffectiveOrder.filter(
      (id) => id !== movedTaskId,
    );

    const destinationTaskOrder =
      sourceColumnId === destinationColumnId
        ? sourceTaskOrder
        : destinationEffectiveOrder.filter((id) => id !== movedTaskId);

    const clampedPosition = Math.max(
      0,
      Math.min(position, destinationTaskOrder.length),
    );
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
          update: {
            $set: { columnId: destinationColumnObjectId, position: index },
          },
        },
      });
    }

    if (sourceColumnId !== destinationColumnId) {
      for (const [index, id] of sourceTaskOrder.entries()) {
        updates.push({
          updateOne: {
            filter: { _id: new Types.ObjectId(id) },
            update: {
              $set: { columnId: sourceColumnObjectId, position: index },
            },
          },
        });
      }
    }

    if (updates.length > 0) {
      await TaskModel.bulkWrite(updates);
    }
  },
  async deleteTask(taskId: string) {
    const task = await TaskModel.findByIdAndDelete(taskId);
    if (task) {
      await ColumnModel.findByIdAndUpdate(task.columnId, {
        $pull: { taskOrder: task._id },
      });
    }
  },
  async addAttachmentToTask(
    taskId: string,
    attachment: {
      filename: string;
      url: string;
      format?: string;
      uploadedAt?: Date;
    },
  ) {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        $push: { attachments: attachment },
        $inc: { attachmentCount: 1 },
      },
      { returnDocument: "after" },
    );
    return updatedTask;
  },
  async removeAttachmentFromTask(taskId: string, attachmentUrl: string) {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        $pull: { attachments: { url: attachmentUrl } },
        $inc: { attachmentCount: -1 },
      },
      { returnDocument: "after" },
    );
    return updatedTask;
  },
};

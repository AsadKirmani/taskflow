import { z } from "zod";

export const createColumnDto = z.object({
  name: z.string().min(1).max(80),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export const updateColumnDto = z.object({
  name: z.string().min(1).max(80).optional(),
});

export const reorderTasksDto = z.object({
  taskOrder: z.array(z.string().min(1)),
});

export type CreateColumnDto = z.infer<typeof createColumnDto>;
export type UpdateColumnDto = z.infer<typeof updateColumnDto>;
export type ReorderTasksDto = z.infer<typeof reorderTasksDto>;

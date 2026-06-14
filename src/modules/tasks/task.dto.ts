import { z } from 'zod';

const taskLabelDto = z.object({
  name: z.string().min(1).max(40),
  color: z.string().min(3).max(20)
});

const checklistItemDto = z.object({
  title: z.string().min(1).max(120),
  isCompleted: z.boolean().optional().default(false)
});

export const createTaskDto = z.object({
  workspaceId: z.string().min(1),
  boardId: z.string().min(1),
  columnId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional().default(''),
  assigneeIds: z.array(z.string()).optional().default([]),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  labels: z.array(taskLabelDto).optional().default([]),
  checklist: z.array(checklistItemDto).optional().default([])
});

export const updateTaskDto = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  labels: z.array(taskLabelDto).optional(),
  checklist: z.array(checklistItemDto).optional(),
  isCompleted: z.boolean().optional()
});

export const moveTaskDto = z.object({
  sourceColumnId: z.string().min(1),
  targetColumnId: z.string().min(1),
  sourceIndex: z.number().int().min(0),
  targetIndex: z.number().int().min(0)
});

export type CreateTaskDto = z.infer<typeof createTaskDto>;
export type UpdateTaskDto = z.infer<typeof updateTaskDto>;
export type MoveTaskDto = z.infer<typeof moveTaskDto>;
import { z } from 'zod';

export const createCommentDto = z.object({
  content: z.string().min(1).max(5000),
});

export const updateCommentDto = z.object({
  content: z.string().min(1).max(5000)
});

export type CreateCommentDto = z.infer<typeof createCommentDto>;
export type UpdateCommentDto = z.infer<typeof updateCommentDto>;
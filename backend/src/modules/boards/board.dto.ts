import { z } from "zod";

export const createBoardDto = z.object({
  name: z.string().min(2).max(120),
  workSpaceName: z.string().min(2).max(120),
  description: z.string().max(1000).optional().default(""),
  visibility: z.enum(["private", "workspace"]).optional().default("workspace"),
});

export const updateBoardDto = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(1000).optional(),
  visibility: z.enum(["private", "workspace"]).optional(),
  archived: z.boolean().optional(),
});

export const reorderColumnsDto = z.object({
  columnOrder: z.array(z.string().min(1)).min(1),
});

export type CreateBoardDto = z.infer<typeof createBoardDto>;
export type UpdateBoardDto = z.infer<typeof updateBoardDto>;
export type ReorderColumnsDto = z.infer<typeof reorderColumnsDto>;

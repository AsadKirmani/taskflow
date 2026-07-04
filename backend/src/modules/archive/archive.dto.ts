import { z } from "zod";

export const archiveEntityDto = z.object({
  workspaceId: z.string().min(1),
  entityType: z.enum(["board", "column", "task"]),
  entityId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export const restoreEntityDto = z.object({
  workspaceId: z.string().min(1),
  entityType: z.enum(["board", "column", "task"]),
  entityId: z.string().min(1),
});

export const listArchiveQueryDto = z.object({
  entityType: z.enum(["board", "column", "task"]).optional(),
  includeRestored: z
    .string()
    .transform((value) => value === "true")
    .optional(),
});

export type ArchiveEntityDto = z.infer<typeof archiveEntityDto>;
export type RestoreEntityDto = z.infer<typeof restoreEntityDto>;

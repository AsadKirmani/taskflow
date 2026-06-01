import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createColumnDto,
  reorderTasksDto,
  updateColumnDto,
} from "./column.dto";
import { asyncHandler } from "../../shared/utils/async-handler";
import { columnController } from "./column.controller";

const router = Router();

router.get(
  "/boards/:boardId/columns",
  authMiddleware,
  asyncHandler(columnController.getColumnsByBoardId),
);

router.patch(
  "/boards/:boardId/columns/reorder",
  authMiddleware,
  asyncHandler(columnController.reorderColumns),
);

router.post(
  "/workspaces/:workspaceId/boards/:boardId/columns",
  authMiddleware,
  validate(createColumnDto),
  asyncHandler(columnController.createColumn),
);

router.patch(
  "/workspaces/:workspaceId/boards/:boardId/columns/:columnId",
  authMiddleware,
  validate(updateColumnDto),
  asyncHandler(columnController.updateColumn),
);

router.patch(
  "/workspaces/:workspaceId/boards/:boardId/columns/:columnId/reorder-tasks",
  authMiddleware,
  validate(reorderTasksDto),
  asyncHandler(columnController.reorderTasks),
);

export default router;

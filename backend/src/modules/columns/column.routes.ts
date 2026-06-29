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

router.post(
  "/columns",
  authMiddleware,
  validate(createColumnDto),
  asyncHandler(columnController.createColumn),
);
router.get(
  "/boards/:boardId/columns",
  authMiddleware,
  asyncHandler(columnController.getColumnsByBoardId),
);

router.patch(
  "/columns/:columnId",
  authMiddleware,
  validate(updateColumnDto),
  asyncHandler(columnController.updateColumn),
);

router.patch(
  "/columns/:columnId/reorder-tasks",
  authMiddleware,
  validate(reorderTasksDto),
  asyncHandler(columnController.reorderTasks),
);

export default router;

import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createTaskDto, moveTaskDto, updateTaskDto } from "./task.dto";
import { asyncHandler } from "../../shared/utils/async-handler";
import { taskController } from "./task.controller";
import { uploadMiddleware } from "../../middleware/upload.middleware";

const router = Router();

router.get(
  "/boards/:boardId/tasks",
  authMiddleware,
  asyncHandler(taskController.getTasksInBoard),
);

router.post(
  "/tasks",
  authMiddleware,
  validate(createTaskDto),
  asyncHandler(taskController.createTask),
);

router.post(
  "/tasks/:taskId/attachments",
  authMiddleware,
  uploadMiddleware.single("file"),
  asyncHandler(taskController.addAttachment),
);

router.delete(
  "/tasks/:taskId/attachments",
  authMiddleware,
  asyncHandler(taskController.removeAttachment),
);

router.get(
  "/tasks/:taskId",
  authMiddleware,
  asyncHandler(taskController.getTaskById),
);

router.patch(
  "/tasks/:taskId",
  authMiddleware,
  validate(updateTaskDto),
  asyncHandler(taskController.updateTask),
);

router.patch(
  "/tasks/:taskId/move",
  authMiddleware,
  validate(moveTaskDto),
  asyncHandler(taskController.moveTask),
);

router.delete(
  "/tasks/:taskId",
  authMiddleware,
  asyncHandler(taskController.deleteTask),
);

export default router;

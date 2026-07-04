import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createCommentDto, updateCommentDto } from "./comment.dto";
import { asyncHandler } from "../../shared/utils/async-handler";
import { commentController } from "./comment.controller";

const router = Router();

router.get(
  "/tasks/:taskId/comments",
  authMiddleware,
  asyncHandler(commentController.getCommentsByTaskId),
);

router.post(
  "/tasks/:taskId/comments",
  authMiddleware,
  validate(createCommentDto),
  asyncHandler(commentController.createComment),
);

router.patch(
  "/comments/:commentId",
  authMiddleware,
  validate(updateCommentDto),
  asyncHandler(commentController.updateComment),
);

router.delete(
  "/comments/:commentId",
  authMiddleware,
  asyncHandler(commentController.deleteComment),
);

export default router;

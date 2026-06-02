import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { createCommentDto, updateCommentDto } from './comment.dto';
import { asyncHandler } from '../../shared/utils/async-handler';
import { commentController } from './comment.controller';

const router = Router();

router.get('/workspaces/:workspaceId/boards/:boardId/tasks/:taskId/comments', authMiddleware, asyncHandler(commentController.getCommentsByTaskId));

router.post(
  '/workspaces/:workspaceId/boards/:boardId/tasks/:taskId/comments',
  authMiddleware,
  validate(createCommentDto),
  asyncHandler(commentController.createComment)
);

router.patch(
  '/workspaces/:workspaceId/boards/:boardId/tasks/:taskId/comments/:commentId',
  authMiddleware,
  validate(updateCommentDto),
  asyncHandler(commentController.updateComment)
);

export default router;
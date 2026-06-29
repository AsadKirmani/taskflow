import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { activityController } from './activity.controller';

const router = Router();

router.get(
  '/',
  authMiddleware,
  asyncHandler(activityController.getGlobalActivity)
);

router.get(
  '/workspaces/:workspaceId/activity',
  authMiddleware,
  asyncHandler(activityController.getWorkspaceActivity)
);

router.get(
  '/workspaces/:workspaceId/boards/:boardId/activity',
  authMiddleware,
  asyncHandler(activityController.getBoardActivity)
);

router.get(
  '/tasks/:taskId/activity',
  authMiddleware,
  asyncHandler(activityController.getTaskActivity)
);

export default router;

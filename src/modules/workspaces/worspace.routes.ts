import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createWorkspaceDto,
  inviteWorkspaceMemberDto,
  updateWorkspaceDto,
  updateWorkspaceMemberRoleDto
} from './workspace.dto';
import { createBoardDto } from '../boards/board.dto';
import { boardController } from '../boards/board.controller';
import { asyncHandler } from '../../shared/utils/async-handler';
import { workspaceController } from './workspace.controller';

const router = Router();

router.get('/', authMiddleware, asyncHandler(workspaceController.listWorkspaces));

router.post('/', authMiddleware, validate(createWorkspaceDto), asyncHandler(workspaceController.createWorkspace));

router.post(
  '/invites/accept',
  authMiddleware,
  asyncHandler(workspaceController.acceptWorkspaceInvite)
);

router.get('/:workspaceId', authMiddleware, asyncHandler(workspaceController.getWorkspaceDetail));

router.patch('/:workspaceId', authMiddleware, validate(updateWorkspaceDto), asyncHandler(workspaceController.updateWorkSpace));

router.post(
  '/:workspaceId/boards',
  authMiddleware,
  validate(createBoardDto),
  asyncHandler(boardController.createBoard)
);

router.post(
  '/:workspaceId/invites',
  authMiddleware,
  validate(inviteWorkspaceMemberDto),
  asyncHandler(workspaceController.inviteWorkspaceMember)
);

router.get('/:workspaceId/members', authMiddleware, (_req, res) => {
  res.json({ success: true, data: { items: [] } });
});

router.patch(
  '/:workspaceId/members/:memberId/role',
  authMiddleware,
  validate(updateWorkspaceMemberRoleDto),
  (_req, res) => {
    res.json({ success: true, message: 'Update member role placeholder', data: null });
  }
);

export default router;
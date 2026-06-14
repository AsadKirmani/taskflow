import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createBoardDto, reorderColumnsDto, updateBoardDto } from "./board.dto";
import { boardController } from "./board.controller";
import { asyncHandler } from "../../shared/utils/async-handler";

const router = Router();

router.get(
  "/workspaces/:workspaceId/boards",
  authMiddleware,
  asyncHandler(boardController.getBoardsInWorkspace),
);
router.post(
  "/boards",
  authMiddleware,
  validate(createBoardDto),
  asyncHandler(boardController.createBoard),
);
router.get(
  "/boards",
  authMiddleware,
  asyncHandler(boardController.getBoards),
);
router.get(
  "/boards/:boardId",
  authMiddleware,
  asyncHandler(boardController.getBoardById),
);

router.patch(
  "/boards/:boardId",
  authMiddleware,
  validate(updateBoardDto),
  asyncHandler(boardController.updateBoard),
);

router.delete(
  "/boards/:boardId",
  authMiddleware,
  asyncHandler(boardController.deleteBoard),
);

router.patch(
  "/boards/:boardId/reorder-columns",
  authMiddleware,
  validate(reorderColumnsDto),
  asyncHandler(boardController.reorderColumns),
);

export default router;

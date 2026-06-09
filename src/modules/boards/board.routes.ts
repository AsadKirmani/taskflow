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
  "/",
  authMiddleware,
  validate(createBoardDto),
  asyncHandler(boardController.createBoard),
);
router.get(
  "/",
  authMiddleware,
  asyncHandler(boardController.getBoards),
);
router.get(
  ":boardId",
  authMiddleware,
  asyncHandler(boardController.getBoardById),
);

router.patch(
  ":boardId",
  authMiddleware,
  validate(updateBoardDto),
  asyncHandler(boardController.updateBoard),
);

router.delete(
  "/:boardId",
  authMiddleware,
  asyncHandler(boardController.deleteBoard),
);

// router.patch(
//   "/workspaces/:workspaceId/boards/:boardId/reorder-columns",
//   authMiddleware,
//   validate(reorderColumnsDto),
//   asyncHandler(boardController.reorderColumns),
// );

export default router;

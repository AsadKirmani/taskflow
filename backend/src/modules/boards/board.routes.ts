import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createBoardDto, reorderColumnsDto, updateBoardDto } from "./board.dto";
import { boardController } from "./board.controller";
import { asyncHandler } from "../../shared/utils/async-handler";

const router = Router();

router.get(
  "/",
  authMiddleware,
  asyncHandler(boardController.getBoards),
);

router.get(
  "/:boardId",
  authMiddleware,
  asyncHandler(boardController.getBoardById),
);

router.post(
  "/workspaces/:workspaceId/boards",
  authMiddleware,
  validate(createBoardDto),
  asyncHandler(boardController.createBoard),
);

router.get(
  "/workspaces/:workspaceId/boards/:boardId",
  authMiddleware,
  asyncHandler(boardController.getBoardById),
);

router.patch(
  "/workspaces/:workspaceId/boards/:boardId",
  authMiddleware,
  validate(updateBoardDto),
  asyncHandler(boardController.updateBoard),
);

router.patch(
  "/workspaces/:workspaceId/boards/:boardId/reorder-columns",
  authMiddleware,
  validate(reorderColumnsDto),
  (_req, res) => {
    res.json({
      success: true,
      message: "Reorder columns placeholder",
      data: null,
    });
  },
);

export default router;

import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { validate } from "../../middleware/validation.middleware";
import { archiveEntityDto, restoreEntityDto } from "./archive.dto";
import { archiveController } from "./archive.controller";

const router = Router();

router.post(
  "/archive",
  authMiddleware,
  validate(archiveEntityDto),
  asyncHandler(archiveController.archiveEntity),
);

router.post(
  "/archive/restore",
  authMiddleware,
  validate(restoreEntityDto),
  asyncHandler(archiveController.restoreEntity),
);

router.get(
  "/workspaces/:workspaceId/archive",
  authMiddleware,
  asyncHandler(archiveController.listArchived),
);

export default router;

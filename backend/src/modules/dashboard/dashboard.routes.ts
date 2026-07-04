import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";

const router = Router();

router.get(
  "/summary",
  authMiddleware,
  asyncHandler(dashboardController.getDashboardSummary),
);

export default router;

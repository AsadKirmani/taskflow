import { Request, Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service";
import { AppError } from "../../shared/errors/app-error";

export class DashboardController {
  async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth!.userId;
      const { workspaceId } = req.query as { workspaceId: string };

      if (!workspaceId) {
        return next(new AppError("Workspace ID is required", 400));
      }

      const summary = await dashboardService.getSummary(workspaceId, userId);

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();

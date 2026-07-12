import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import workspaceRoutes from "./modules/workspaces/worspace.routes";
import boardRoutes from "./modules/boards/board.routes";
import columnRoutes from "./modules/columns/column.routes";
import taskRoutes from "./modules/tasks/task.routes";
import commentRoutes from "./modules/comments/comment.routes";
import activityRoutes from "./modules/activity/activity.routes";
import archiveRoutes from "./modules/archive/archive.routes";
import searchRoutes from "./modules/search/search.routes";
import webhookRoutes from "./routes/webhook.routes";
import { errorMiddleware } from "./middleware/error.middleware";
console.log("Server started", new Date().toISOString());

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

const corsOriginSet = new Set(corsOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (corsOriginSet.size === 0 || corsOriginSet.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to Taskflow API",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Taskflow API is running",
    health: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
  console.log("Health check endpoint was called. Uptime:", process.uptime());
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1", boardRoutes);
app.use("/api/v1", columnRoutes);
app.use("/api/v1", taskRoutes);
app.use("/api/v1", commentRoutes);
app.use("/api/v1", activityRoutes);
app.use("/api/v1", archiveRoutes);
app.use("/api/v1", searchRoutes);
app.use("/api/v1/webhooks", webhookRoutes);

app.use(errorMiddleware);

export default app;

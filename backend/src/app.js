import express from "express";
import cors from "cors";
import helmet from "helmet";

import errorHandler from "./middlewares/error.middleware.js";
import {ApiError} from "./utils/apiError.js";
import {ApiResponse} from "./utils/apiResponse.js";
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import teamRoutes from "./routes/team.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import meetingRoutes from "./routes/meeting.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import superAdminRoutes from "./routes/superAdmin.routes.js";
import fileRoutes from "./routes/file.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/health", (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { status: "UP", timestamp: new Date().toISOString() }, "API is healthy"));
});

app.get("/api/v1/health", (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { status: "UP", timestamp: new Date().toISOString() }, "API v1 is healthy"));
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/meetings", meetingRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/files", fileRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

app.use(errorHandler); // error handling centralised

export default app;

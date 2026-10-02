import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  createMilestone,
} from "../controllers/task.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyTenant } from "../middlewares/tenant.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyAuth, verifyTenant);

router.get(
  "/",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  getTasks
);

router.post(
  "/",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  createTask
);

router.patch(
  "/:id/status",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  updateTaskStatus
);

router.post(
  "/milestones",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  createMilestone
);

export default router;

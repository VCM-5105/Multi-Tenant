import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
} from "../controllers/project.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyTenant } from "../middlewares/tenant.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyAuth, verifyTenant);

router.get(
  "/",
  authorizeRoles("agency_admin", "agency_team", "client", "super_admin"),
  getProjects
);

router.get(
  "/:id",
  authorizeRoles("agency_admin", "agency_team", "client", "super_admin"),
  getProjectById
);

router.post(
  "/",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  createProject
);

router.put(
  "/:id",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  updateProject
);

export default router;

import { Router } from "express";
import {
  getFeedback,
  createFeedback,
  updateFeedback,
} from "../controllers/feedback.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyTenant } from "../middlewares/tenant.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyAuth, verifyTenant);

router.get(
  "/",
  authorizeRoles("agency_admin", "agency_team", "client", "super_admin"),
  getFeedback
);

router.post(
  "/",
  authorizeRoles("agency_admin", "agency_team", "client", "super_admin"),
  createFeedback
);

router.patch(
  "/:id",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  updateFeedback
);

export default router;

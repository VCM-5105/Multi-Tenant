import { Router } from "express";
import {
  getMeetings,
  createMeeting,
} from "../controllers/meeting.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyTenant } from "../middlewares/tenant.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyAuth, verifyTenant);

router.get(
  "/",
  authorizeRoles("agency_admin", "agency_team", "client", "super_admin"),
  getMeetings
);

router.post(
  "/",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  createMeeting
);

export default router;

import { Router } from "express";
import {
  getTeamMembers,
  addTeamMember,
} from "../controllers/team.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyTenant } from "../middlewares/tenant.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyAuth, verifyTenant);

router.get("/", authorizeRoles("agency_admin", "agency_team", "super_admin"), getTeamMembers);

router.post("/", authorizeRoles("agency_admin", "super_admin"), addTeamMember);

export default router;

import { Router } from "express";
import {
  getPlatformStats,
  getAllAgencies,
  getAgencyDetail,
  updateAgencyStatus,
  enterSupportMode,
  getPlatformActivity,
} from "../controllers/superAdmin.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyAuth, authorizeRoles("super_admin"));

router.get("/stats", getPlatformStats);
router.get("/agencies", getAllAgencies);
router.get("/agencies/:id", getAgencyDetail);
router.patch("/agencies/:id/status", updateAgencyStatus);
router.post("/agencies/:id/support-mode", enterSupportMode);
router.get("/activity", getPlatformActivity);

export default router;

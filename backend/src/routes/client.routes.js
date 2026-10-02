import { Router } from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  createClientUser,
} from "../controllers/client.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyTenant } from "../middlewares/tenant.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyAuth, verifyTenant);

router.get("/", authorizeRoles("agency_admin", "agency_team", "super_admin"), getClients);
router.get("/:id", authorizeRoles("agency_admin", "agency_team", "super_admin"), getClientById);

router.post("/", authorizeRoles("agency_admin", "super_admin"), createClient);
router.put("/:id", authorizeRoles("agency_admin", "super_admin"), updateClient);


router.post("/:id/users", authorizeRoles("agency_admin", "super_admin"), createClientUser);

export default router;

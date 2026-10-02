import { Router } from "express";
import {
  uploadFile,
  getFiles,
  downloadFile,
} from "../controllers/file.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyTenant } from "../middlewares/tenant.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(verifyAuth, verifyTenant);


router.get(
  "/",
  authorizeRoles("agency_admin", "agency_team", "client", "super_admin"),
  getFiles
);

router.get(
  "/:id/download",
  authorizeRoles("agency_admin", "agency_team", "client", "super_admin"),
  downloadFile
);


router.post(
  "/",
  authorizeRoles("agency_admin", "agency_team", "super_admin"),
  upload.single("file"),
  uploadFile
);

export default router;

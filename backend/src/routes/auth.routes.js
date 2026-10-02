import { Router } from "express";
import {
  login,
  registerAgency,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();


router.post("/register-agency", registerAgency);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", verifyAuth, getMe);

export default router;

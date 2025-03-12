import { verifyUser } from "../controllers/verification.controller.js";
import { Router } from "express";

const router = Router();
router.get("/:token", verifyUser);

export default router;
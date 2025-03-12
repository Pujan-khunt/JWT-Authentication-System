import { refreshLimiter } from "../middlewares/refreshLimiter.middleware.js";
import { registerUser } from "../controllers/register.controller.js";
import { Router } from "express";

const router = Router();
router.post("/", refreshLimiter, registerUser);

export default router;
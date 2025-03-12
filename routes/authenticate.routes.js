import { authenticateUser } from "../controllers/authenticate.controller.js";
import { refreshLimiter } from "../middlewares/refreshLimiter.middleware.js";
import { Router } from "express";

const router = Router();
router.post("/", refreshLimiter, authenticateUser);

export default router;
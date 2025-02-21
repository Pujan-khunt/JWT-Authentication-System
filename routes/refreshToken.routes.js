import { handleRefreshToken } from "../controllers/refreshToken.controller.js";
import { Router } from "express";
const router = Router();

router.get("/", handleRefreshToken);

export default router;
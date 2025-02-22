import { logoutUser } from "../controllers/logout.controller.js";
import { Router } from "express";
const router = Router();

router.post("/", logoutUser);

export default router;

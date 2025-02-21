import { authenticateUser } from "../controllers/authenticate.controller.js";
import { Router } from "express";
const router = Router();

router.post("/", authenticateUser);

export default router;
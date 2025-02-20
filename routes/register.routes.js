import { registerUser } from "../controllers/register.controller.js";
import { Router } from "express";
const router = Router();

router.post("/", registerUser);

export default router;
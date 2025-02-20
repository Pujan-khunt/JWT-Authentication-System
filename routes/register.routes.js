import { registerUser } from "../controllers/register.controller.js";
import { Router } from "express";
const router = Router();

router.route("/").post(registerUser);

export default router;
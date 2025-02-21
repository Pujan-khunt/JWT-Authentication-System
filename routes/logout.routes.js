import {logoutUser} from "../controllers/"
import { Router } from "express";
const router = Router();

router.post("/", logoutUser);

export default router;

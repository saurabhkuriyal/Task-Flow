import express from "express";
import type { Router } from "express";
import authController from "../controllers/auth.controller.js";

const router: Router = express.Router();

router.post("/signup", authController.signUp);

export default router;
import express from "express";
import { acceptInvite } from "../controllers/inviteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.put("/accept/:token", authMiddleware, acceptInvite);
export default router;

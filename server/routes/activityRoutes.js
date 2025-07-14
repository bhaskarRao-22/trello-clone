import express from "express";
import { getBoardActivities } from "../controllers/activityController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/:boardId", authMiddleware, getBoardActivities);
export default router;

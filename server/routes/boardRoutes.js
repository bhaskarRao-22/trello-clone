import express from "express";
import {
  createBoard,
  getBoards,
  inviteMember,
  getBoardById,
  getBoardInvites,
} from "../controllers/boardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBoard);
router.get("/", authMiddleware, getBoards);
router.get("/:id", authMiddleware, getBoardById);
router.post("/:boardId/invite", authMiddleware, inviteMember);
router.get("/:id/invites", authMiddleware, getBoardInvites);

export default router;

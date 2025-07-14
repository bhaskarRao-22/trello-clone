import express from "express";
import { upload } from "../middleware/multer.js";
import { uploadAttachment } from "../controllers/taskController.js";
import { createTask, getTasksByList } from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { updateTaskOrder, updateTask } from "../controllers/taskController.js";

const router = express.Router();
router.post("/", authMiddleware, createTask);
router.get("/:listId", authMiddleware, getTasksByList);
router.put("/reorder", authMiddleware, updateTaskOrder);
router.put("/:taskId", authMiddleware, updateTask);
router.post("/:taskId/attachment", authMiddleware, upload.single("file"), uploadAttachment);

export default router;

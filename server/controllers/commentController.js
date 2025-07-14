import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import { logActivity } from "../utils/logActivity.js";

export const createComment = async (req, res) => {
  try {
    const { taskId, text, boardId } = req.body;
    const comment = await Comment.create({
      taskId,
      userId: req.user.id,
      text,
    });
    const populated = await comment.populate("userId", "name email");

    await logActivity({
      boardId,
      userId: req.user.id,
      action: "Commented",
      taskId,
      meta: { commentText: text },
    });

    // Emit event to all users on that board
    req.io.to(boardId).emit("newComment", { boardId, taskId }); // BROADCAST

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: "Failed to add comment", err });
  }
};

export const getComments = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const comments = await Comment.find({ taskId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch comments", err });
  }
};

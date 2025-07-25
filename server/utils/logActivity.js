import Activity from "../models/Activity.js";

export const logActivity = async ({ boardId, userId, action, taskId = null, meta = {}, io }) => {
  try {
    const activity = await Activity.create({ boardId, userId, action, taskId, meta });

    const populatedActivity = await Activity.findById(activity._id)
      .populate("userId", "name")
      .populate("taskId", "title");

    if (io) {
      io.to(boardId.toString()).emit("newActivity", { activity: populatedActivity });
    }
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};

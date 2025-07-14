import Activity from "../models/Activity.js";

export const logActivity = async ({ boardId, userId, action, taskId = null, meta = {} }) => {
  try {
    await Activity.create({ boardId, userId, action, taskId, meta });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};

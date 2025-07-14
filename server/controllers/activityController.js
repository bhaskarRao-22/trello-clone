import Activity from "../models/Activity.js";

export const getBoardActivities = async (req, res) => {
  try {
    const boardId = req.params.boardId;

    const activities = await Activity.find({ boardId })
      .populate("userId", "name email")
      .populate("taskId", "title")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch activity logs", err });
  }
};

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "Updated Task", "Commented", "Uploaded File"
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    meta: { type: Object }, // additional info
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);

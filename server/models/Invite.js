// models/Invite.js
import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
    role: {
      type: String,
      enum: ["Admin", "Editor", "Viewer"],
      default: "Viewer",
    },
    token: String,
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Invite", inviteSchema);

import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["Admin", "Editor", "Viewer"], default: "Viewer" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);

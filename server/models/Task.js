import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    label: {
      type: String,
      enum: ["Bug", "Feature", "Urgent", "Improvement", "None"],
      default: "None",
    },
    labelColor: { type: String, default: "#9CA3AF" }, // gray
    dueDate: { type: Date },
    attachments: [
      {
        url: String,
        filename: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);

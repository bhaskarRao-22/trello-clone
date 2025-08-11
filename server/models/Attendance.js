import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    uid: {
      type: Number,
      required: true,
    },
    bioId: {
      type: String,
      required: true,
    },
    bioName: {
      type: String,
      required: true,
    },
    deviceIp: {
      type: String,
      required: true,
    },
    attTimestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Attendance", attendanceSchema);

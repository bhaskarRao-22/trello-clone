import mongoose from "mongoose";

const BiometricUserSchema = new mongoose.Schema(
  {
    bioId: { type: String, required: true, unique: true },
    bioName: { type: String, required: true },
    designation: { type: String, default: "Employee" },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true }, 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BiometricUser", BiometricUserSchema);

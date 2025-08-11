import express from "express";
import { getMonthlySummary } from "../controllers/attendanceController.js";

const router = express.Router();

// router.get('/', getAllAttendance);
router.get("/monthly-summary", getMonthlySummary);

export default router;

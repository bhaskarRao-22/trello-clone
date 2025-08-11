import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import listRoutes from "./routes/listRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import { initSocket, getIO } from "./socket/socket.js";
import { fetchAndStoreAttendance } from "./services/biometricService.js";
import biometricUserRoutes from "./routes/biometricUserRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = initSocket(server);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/biometric-users", biometricUserRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinBoard", (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined board ${boardId}`);
  });

  socket.on("leaveBoard", (boardId) => {
    socket.leave(boardId);
    console.log(`Socket ${socket.id} left board ${boardId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Mongo Error:", err));

// Schedule biometric sync every 5 seconds
cron.schedule("*/5 * * * * *", () => {
  fetchAndStoreAttendance();
});

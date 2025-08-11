import ZKLib from "node-zklib";
import Attendance from "../models/Attendance.js";
import { getIO } from "../socket/socket.js";
import BiometricUser from "../models/BiometricUser.js";

const zk = new ZKLib("192.168.10.201", 4370, 10000);
let isConnected = false;
let isInProgress = false;

export const fetchAndStoreAttendance = async () => {
  if (isInProgress) return;
  isInProgress = true;

  try {
    if (!isConnected) {
      await zk.createSocket();
      isConnected = true;
    }

    const logs = await zk.getAttendances();
    const users = await zk.getUsers();
    const entries = logs?.data || [];
    const io = getIO();

    // Step 1: Process Biometric Users
    const deviceUsers = users.data || [];
    const deviceUserIds = new Set(
      deviceUsers.map((user) => String(user.userId))
    );

    // Mark users not on device as inactive
    await BiometricUser.updateMany(
      { bioId: { $nin: [...deviceUserIds] }, isActive: true },
      { isActive: false }
    );

    // Upsert & activate users found on device
    for (const user of deviceUsers) {
      const bioId = String(user.userId);
      const bioName = user.name || "Unknown";

      if (!bioId || !bioName) continue;

      await BiometricUser.updateOne(
        { bioId },
        {
          bioId,
          bioName,
          designation: "Employee",
          isActive: true,
        },
        { upsert: true }
      );
    }

    // Step 2: Attendance Entries
    const userMap = new Map();
    deviceUsers.forEach((user) => {
      userMap.set(String(user.userId), user.name);
    });

    for (const entry of entries) {
      const parsedTimestamp = new Date(entry.recordTime);
      const deviceBioId = String(entry.deviceUserId);
      const bioName = userMap.get(deviceBioId) || "Unknown";

      if (isNaN(parsedTimestamp.getTime())) {
        console.warn(`[⚠️] Skipped invalid timestamp: ${entry.recordTime}`);
        continue;
      }

      const exists = await Attendance.findOne({
        bioId: deviceBioId,
        bioName,
        deviceIp: entry.ip,
        attTimestamp: parsedTimestamp,
      });

      if (!exists) {
        const newRecord = await Attendance.create({
          uid: entry.userSn,
          bioId: deviceBioId,
          bioName,
          deviceIp: entry.ip,
          attTimestamp: parsedTimestamp,
        });
        io.emit("new-attendance", newRecord);
      }
    }
  } catch (err) {
    console.error("Attendance sync failed:", err.message);
    if (isConnected) {
      await zk.disconnect().catch((e) => console.error("Disconnect error:", e));
      isConnected = false;
    }
  } finally {
    isInProgress = false;
  }
};

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try {
    if (isConnected) {
      await zk.disconnect();
      console.log("Biometric socket disconnected.");
    }
  } catch (err) {
    console.error("Error disconnecting biometric socket:", err.message);
  } finally {
    process.exit();
  }
});

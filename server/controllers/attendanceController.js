import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import BiometricUser from "../models/BiometricUser.js";

export const getMonthlySummary = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ error: "Month is required" });

  const [year, mon] = month.split("-");
  const start = new Date(`${year}-${mon}-01T00:00:00.000Z`);
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

  try {
    // const logs = await Attendance.find({
    //   attTimestamp: { $gte: start, $lt: end },
    // }).sort({ bioName: 1, attTimestamp: 1 }); // Order by bioName & timestamp

    const logs = await Attendance.find({
      attTimestamp: { $gte: start, $lt: end },
    });
    const userList = await BiometricUser.find({ isActive: true }).sort({
      bioName: 1,
    }); // Get all users, regardless of attendance
    const users = new Map();
    for (let u of userList) {
      users.set(u.bioId, {
        bioId: u.bioId,
        bioName: u.bioName,
        designation: u.designation || "Programmer",
        avatar: u.avatar || null,
        records: {},
      });
    }

    // const userMap = new Map();
    for (let log of logs) {
      const { bioId, bioName, attTimestamp } = log;
      const bioIdStr = String(bioId);
      const dateKey = attTimestamp.toISOString().slice(0, 10);
      let user = users.get(bioIdStr);
      if (!user) {
        user = {
          bioId: bioIdStr,
          bioName,
          designation: "Programmer",
          avatar: null,
          records: {},
        };
        users.set(bioIdStr, user);
      }
      user.records[dateKey] = user.records[dateKey] || [];
      user.records[dateKey].push(attTimestamp);
    }

    const result = [];
    for (let user of users.values()) {
      const daysInMonth = new Date(parseInt(year), parseInt(mon), 0).getDate();
      let pres = 0,
        totalWork = 0,
        totalOvertime = 0;
      const daily = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const day = String(i).padStart(2, "0");
        const date = `${year}-${mon}-${day}`; // yyyy-mm-dd
        const times = user.records[date] || [];

        let inTs = null,
          outTs = null;

        if (times.length === 1) {
          const only = new Date(times[0]);
          if (only.getHours() < 12) {
            inTs = times[0];
          } else {
            outTs = times[0];
          }
        } else if (times.length > 1) {
          inTs = times[0];
          outTs = times[times.length - 1];
        }

        const inDate = inTs ? new Date(inTs) : null;
        const outDate = outTs ? new Date(outTs) : null;

        let durationM = 0,
          lateM = 0,
          earlyM = 0,
          overtimeM = 0;

        const officeStart = new Date(date + "T09:30:00");
        const officeEnd = new Date(date + "T18:15:00");

        if (inDate && inDate > officeStart) {
          lateM = Math.floor((inDate - officeStart) / 60000);
        }

        if (inDate && outDate) {
          durationM = Math.floor((outDate - inDate) / 60000);
          if (outDate < officeEnd) {
            earlyM = Math.floor((officeEnd - outDate) / 60000);
          }
          if (outDate > officeEnd) {
            overtimeM = Math.floor((outDate - officeEnd) / 60000);
          }

          totalWork += durationM;
          totalOvertime += overtimeM;
          pres++;
        }

        daily.push({
          date: date.split("-").reverse().join("-"), // dd-mm-yyyy
          inTime: inDate ? inDate.toISOString() : null,
          outTime: outDate ? outDate.toISOString() : null,
          duration: durationM,
          lateM,
          earlyM,
          overtimeM,
        });
      }

      result.push({
        bioId: user.bioId,
        bioName: user.bioName,
        designation: user.designation,
        avatar: user.avatar,
        presentDays: pres,
        absentDays: daysInMonth - pres,
        totalWorkMinutes: totalWork,
        totalOvertimeMinutes: totalOvertime,
        records: daily,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

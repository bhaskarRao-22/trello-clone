import { useEffect, useState } from "react";
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowUpOnSquareIcon,
  ChevronDownIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const MonthlyAttendance = () => {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/attendance/monthly-summary?month=${month}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [month]);

  const formatMonthYear = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gradient-to-b from-blue-100 via-blue-50 to-white p-6 pt-14 sm:pt-6 overflow-x-auto h-[calc(100vh-0rem)] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">
              📊 Monthly Attendance Summary – {formatMonthYear(month)}
            </h1>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border p-2 rounded shadow-sm w-full sm:w-auto"
            />
          </div>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <div className="space-y-4">
              {data.map((user, index) => {
                const totalHours = Math.floor(user.totalWorkMinutes / 60);
                const totalMinutes = user.totalWorkMinutes % 60;
                return (
                  <div key={user.bioId} className="bg-white p-4 shadow rounded">
                    <div
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer"
                      onClick={() =>
                        setExpanded(expanded === index ? null : index)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                          {user.bioName[0] || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.bioName}
                          </p>
                          <p className="text-sm text-gray-500">
                            BioID: {user.bioId} | {user.designation}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 sm:mt-0">
                        <p className="text-sm text-green-700 flex items-center gap-1">
                          <ShieldCheckIcon className="h-4 w-4" />{" "}
                          {user.presentDays} Present
                        </p>
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <ExclamationCircleIcon className="h-4 w-4" />{" "}
                          {user.absentDays} Absent
                        </p>
                        <p className="text-sm text-blue-600 flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" /> {totalHours}h{" "}
                          {totalMinutes}m
                        </p>
                        <p className="text-sm text-purple-600 flex items-center gap-1">
                          <ArrowUpOnSquareIcon className="h-4 w-4" /> OT:{" "}
                          {Math.floor(user.totalOvertimeMinutes / 60)}h{" "}
                          {user.totalOvertimeMinutes % 60}m
                        </p>
                        <ChevronDownIcon
                          className={`w-5 h-5 transition-transform ${
                            expanded === index ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 border-t-2 border-gray-300 pt-4"
                        >
                          <div className="overflow-x-auto max-h-[400px] relative rounded-md border border-gray-200">
                            <table className="w-full min-w-[600px] text-sm text-left text-gray-700">
                              <thead className="bg-gray-100/30 backdrop-blur-sm sticky top-0 z-10 text-gray-600 font-semibold border-b border-gray-800">
                                <tr>
                                  <th className="pl-3 py-2">Date</th>
                                  <th className="text-center">IN</th>
                                  <th className="text-center">OUT</th>
                                  <th className="text-center">Duration</th>
                                  <th className="text-center">Late</th>
                                  <th className="text-center">Early</th>
                                  <th className="text-center">Overtime</th>
                                </tr>
                              </thead>
                              <tbody>
                                {user.records.map((rec, i) => {
                                  const inTimeStr = rec.inTime
                                    ? new Date(rec.inTime).toLocaleTimeString(
                                        "en-IN",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : "--";
                                  const outTimeStr = rec.outTime
                                    ? new Date(rec.outTime).toLocaleTimeString(
                                        "en-IN",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : "--";

                                  const outClass =
                                    rec.outTime &&
                                    new Date(rec.outTime).getHours() * 60 +
                                      new Date(rec.outTime).getMinutes() <
                                      18 * 60 + 15
                                      ? "text-red-600"
                                      : "text-green-600";

                                  return (
                                    <tr key={i} className="border-b border-gray-300 hover:bg-gray-100">
                                      <td className="pl-3 py-2">{rec.date}</td>
                                      <td className="text-center text-green-600">
                                        {inTimeStr}
                                      </td>
                                      <td className={`text-center ${outClass}`}>
                                        {outTimeStr}
                                      </td>
                                      <td className="text-center">
                                        {Math.floor(rec.duration / 60)}h{" "}
                                        {rec.duration % 60}m
                                      </td>
                                      <td
                                        className={`text-center ${
                                          rec.lateM ? "text-red-600" : ""
                                        }`}
                                      >
                                        {rec.lateM ? `${rec.lateM} min` : "-"}
                                      </td>

                                      <td className="text-center">
                                        {rec.earlyM ? `${rec.earlyM} min` : "-"}
                                      </td>
                                      <td className="text-center">
                                        {rec.overtimeM
                                          ? `${rec.overtimeM} min`
                                          : "-"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MonthlyAttendance;

import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import socket from "../socket";
import { motion, AnimatePresence } from "framer-motion";

function AdminActivityLog({ boardId, token }) {
  const [activities, setActivities] = useState([]);
  const containerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await API.get(`/activities/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching activity logs", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    socket.emit("joinBoard", boardId);

    const handleNewActivity = ({ activity }) => {
      setActivities((prev) => [activity, ...prev]);
    };
    socket.on("newActivity", handleNewActivity);

    return () => {
      socket.emit("leaveBoard", boardId);
      socket.off("newActivity", handleNewActivity);
    };
  }, [boardId, token]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setIsScrolled(containerRef.current.scrollTop > 5);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden max-w-xl h-200 flex flex-col">
      <div
        className={`sticky top-0 z-10 bg-white p-4 border-b border-gray-200 transition-all duration-300 ${
          isScrolled ? "shadow-sm" : ""
        }`}
      >
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-blue-600">📋</span> Activity Log
          {activities.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
              {activities.length} {activities.length === 1 ? "event" : "events"}
            </span>
          )}
        </h3>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar"
      >
        <ul className="relative border-l border-gray-200 ml-3">
          {activities.length === 0 ? (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-4 py-4 text-gray-500 text-sm"
            >
              No activity yet. Actions will appear here.
            </motion.li>
          ) : (
            <AnimatePresence initial={false}>
              {activities.map((act) => (
                <motion.li
                  key={act._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-3"
                >
                  <div className="flex">
                    <span className="absolute -left-3 w-6 h-6 bg-blue-100 rounded-full border-4 border-white flex items-center justify-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    </span>
                    <div className="bg-indigo-500/10 p-3 rounded-lg shadow-xs flex-1 ml-3">
                      <p className="text-sm">
                        <strong className="text-gray-800">
                          {act.userId.name}
                        </strong>{" "}
                        <span className="text-gray-700">{act.action}</span>
                        {act.taskId && (
                          <>
                            {" "}
                            on{" "}
                            <em className="text-blue-600">
                              {act.taskId.title}
                            </em>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <span>{new Date(act.createdAt).toLocaleString()}</span>
                        {act.actionType && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[0.65rem]">
                            {act.actionType}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          )}
        </ul>
      </div>

      <div className="sticky bottom-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </div>
  );
}

export default AdminActivityLog;

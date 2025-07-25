import { useEffect, useState } from "react";
import API from "../api/axios";
import socket from "../socket";

function AdminActivityLog({ boardId, token }) {
  const [activities, setActivities] = useState([]);

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

  // useEffect(() => {
  //   const fetchLogs = async () => {
  //     const res = await API.get(`/activities/${boardId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setActivities(res.data);
  //   };

  //   fetchLogs();
  // }, [boardId, token]);

  return (
    <div className="mt-6 bg-white shadow-lg rounded-lg p-4 max-w-xl">
  <h3 className="text-xl font-semibold mb-4">📋 Activity Log</h3>
  <ul className="relative border-l border-gray-300">
    {activities.length === 0 ? (
      <li className="ml-4 text-gray-500 text-sm">No activity yet.</li>
    ) : activities.map(act => (
      <li key={act._id} className="mb-6 ml-4">
        <span className="absolute -left-2.5 w-5 h-5 bg-blue-600 rounded-full border border-white"></span>
        <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
          <p className="text-sm">
            <strong>{act.userId.name}</strong> {act.action}
            {act.taskId && <> on <em>{act.taskId.title}</em></>}
          </p>
          <p className="text-xs text-gray-400 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
        </div>
      </li>
    ))}
  </ul>
</div>

    // <div className="bg-white p-4 rounded shadow mt-6 max-h-80 overflow-y-auto">
    //   <h3 className="text-lg font-bold mb-3">📋 Board Activity Log</h3>
    //   {activities.length === 0 ? (
    //     <p className="text-gray-500 text-sm">No activity yet.</p>
    //   ) : (
    //     <ul className="space-y-2 text-sm">
    //       {activities.map((act) => (
    //         <li key={act._id} className="border-b pb-1">
    //           <strong>{act.userId.name}</strong> {act.action}
    //           {act.taskId && (
    //             <>
    //               {" "}
    //               on task <em>“{act.taskId.title}”</em>
    //             </>
    //           )}
    //           <br />
    //           <span className="text-gray-400 text-xs">
    //             {new Date(act.createdAt).toLocaleString()}
    //           </span>
    //         </li>
    //       ))}
    //     </ul>
    //   )}
    // </div>
  );
}

export default AdminActivityLog;

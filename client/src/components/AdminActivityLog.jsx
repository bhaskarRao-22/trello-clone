import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminActivityLog({ boardId, token }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await API.get(`/activities/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(res.data);
    };

    fetchLogs();
  }, [boardId, token]);

  return (
    <div className="bg-white p-4 rounded shadow mt-6 max-h-80 overflow-y-auto">
      <h3 className="text-lg font-bold mb-3">📋 Board Activity Log</h3>
      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No activity yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {activities.map((act) => (
            <li key={act._id} className="border-b pb-1">
              <strong>{act.userId.name}</strong> {act.action}
              {act.taskId && <> on task <em>“{act.taskId.title}”</em></>}
              <br />
              <span className="text-gray-400 text-xs">
                {new Date(act.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminActivityLog;

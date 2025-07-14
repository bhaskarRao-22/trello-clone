import { useEffect, useState } from "react";
import API from "../api/axios";
import socket from "../socket";

function TaskModal({ task, onClose, onUpdate, token }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const labelOptions = [
    { label: "None", value: "None", color: "#9CA3AF" },
    { label: "Bug", value: "Bug", color: "#EF4444" },
    { label: "Feature", value: "Feature", color: "#3B82F6" },
    { label: "Urgent", value: "Urgent", color: "#F59E0B" },
    { label: "Improvement", value: "Improvement", color: "#10B981" },
  ];

  const [label, setLabel] = useState(task.label || "None");
  const [labelColor, setLabelColor] = useState(task.labelColor || "#9CA3AF");
  const [dueDate, setDueDate] = useState(task.dueDate?.slice(0, 10) || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setLabel(task.label || "None");
    setLabelColor(task.labelColor || "#9CA3AF");
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
  }, [task]);

  const handleUpdate = async () => {
    try {
      const res = await API.put(
        `/tasks/${task._id}`,
        { title, description, label, labelColor, dueDate: dueDate || null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate(res.data);
      onClose();

      socket.emit("taskUpdated", {
        boardId: task.boardId || "",
        taskId: task._id,
      });
    } catch (err) {
      alert("Failed to update task");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      alert("Error loading comments");
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await API.post(
        "/comments",
        { taskId: task._id, text: commentText, boardId: task.boardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");

      socket.emit("newComment", {
        boardId: task.boardId || "",
        taskId: task._id,
      });
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [task._id]);

  useEffect(() => {
    const handleNewComment = (data) => {
      if (data.taskId === task._id) {
        fetchComments(); // refresh current task's comments
      }
    };

    socket.on("newComment", handleNewComment);
    return () => {
      socket.off("newComment", handleNewComment);
    };
  }, [task._id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await API.post(`/tasks/${task._id}/attachment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onUpdate(res.data); // update task with new attachments
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] relative shadow-lg">
        <button
          className="absolute top-2 right-3 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        <input
          type="text"
          className="w-full border rounded p-2 mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          rows={5}
          className="w-full border rounded p-2 mb-4"
          placeholder="Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="mb-4">
          <label className="block font-medium mb-1">Label</label>
          <select
            value={label}
            onChange={(e) => {
              const selected = labelOptions.find(
                (l) => l.value === e.target.value
              );
              setLabel(selected.value);
              setLabelColor(selected.color);
            }}
            className="w-full border rounded p-2"
          >
            {labelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>

      <hr className="my-4" />
      <h3 className="text-md font-semibold mb-2">Comments</h3>

      <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
        {comments.map((c) => (
          <div key={c._id} className="border p-2 rounded">
            <p className="text-sm">
              <strong>{c.userId.name}</strong> •{" "}
              <span className="text-gray-500 text-xs">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </p>
            <p className="text-sm mt-1">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Write a comment..."
        />
        <button
          onClick={addComment}
          className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Attachments</label>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="text-sm mb-2"
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
          {task.attachments?.map((att, i) => (
            <li key={i}>
              📎{" "}
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                {att.filename}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TaskModal;

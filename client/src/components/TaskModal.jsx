import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import API from "../api/axios";
import socket from "../socket";

function TaskModal({ task, onClose, onUpdate, token }) {
  // const [open, setOpen] = useState(true);
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
    setCommentText("");
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
    // <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    //   <div className="bg-white rounded-xl p-6 w-[400px] relative shadow-lg">
    //     <button
    //       className="absolute top-2 right-3 text-gray-600 hover:text-black"
    //       onClick={onClose}
    //     >
    //       ✕
    //     </button>
    //     <h2 className="text-xl font-bold mb-4">Edit Task</h2>

    //     <input
    //       type="text"
    //       className="w-full border rounded p-2 mb-3"
    //       value={title}
    //       onChange={(e) => setTitle(e.target.value)}
    //     />

    //     <textarea
    //       rows={5}
    //       className="w-full border rounded p-2 mb-4"
    //       placeholder="Description..."
    //       value={description}
    //       onChange={(e) => setDescription(e.target.value)}
    //     />

    //     <div className="mb-4">
    //       <label className="block font-medium mb-1">Label</label>
    //       <select
    //         value={label}
    //         onChange={(e) => {
    //           const selected = labelOptions.find(
    //             (l) => l.value === e.target.value
    //           );
    //           setLabel(selected.value);
    //           setLabelColor(selected.color);
    //         }}
    //         className="w-full border rounded p-2"
    //       >
    //         {labelOptions.map((opt) => (
    //           <option key={opt.value} value={opt.value}>
    //             {opt.label}
    //           </option>
    //         ))}
    //       </select>
    //     </div>

    //     <div className="mb-4">
    //       <label className="block font-medium mb-1">Due Date</label>
    //       <input
    //         type="date"
    //         value={dueDate}
    //         onChange={(e) => setDueDate(e.target.value)}
    //         className="w-full border rounded p-2"
    //       />
    //     </div>

    //     <button
    //       onClick={handleUpdate}
    //       className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    //     >
    //       Save
    //     </button>

    //     <hr className="my-4" />

    //     <h3 className="text-md font-semibold mb-2">Comments</h3>

    //     <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
    //       {comments.map((c) => (
    //         <div key={c._id} className="border p-2 rounded">
    //           <p className="text-sm">
    //             <strong>{c.userId.name}</strong> •{" "}
    //             <span className="text-gray-500 text-xs">
    //               {new Date(c.createdAt).toLocaleString()}
    //             </span>
    //           </p>
    //           <p className="text-sm mt-1">{c.text}</p>
    //         </div>
    //       ))}
    //     </div>

    //     <div className="flex gap-2">
    //       <input
    //         type="text"
    //         value={commentText}
    //         onChange={(e) => setCommentText(e.target.value)}
    //         className="flex-1 border p-2 rounded"
    //         placeholder="Write a comment..."
    //       />
    //       <button
    //         onClick={addComment}
    //         className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600"
    //       >
    //         Send
    //       </button>
    //     </div>

    //     <div className="mb-4">
    //       <label className="block font-medium mb-1">Attachments</label>
    //       <input
    //         type="file"
    //         onChange={handleFileUpload}
    //         disabled={uploading}
    //         className="text-sm mb-2"
    //       />
    //       {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
    //       <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
    //         {task.attachments?.map((att, i) => (
    //           <li key={i}>
    //             📎{" "}
    //             <a
    //               href={att.url}
    //               target="_blank"
    //               rel="noopener noreferrer"
    //               className="underline text-blue-600"
    //             >
    //               {att.filename}
    //             </a>
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //   </div>
    // </div>

    <Dialog open={true} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-xl xl:max-w-xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 max-h-[80vh] overflow-y-auto"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-2 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-center">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold text-gray-900"
                      >
                        📝 Edit Task
                      </DialogTitle>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: labelColor }}
                        ></span>
                        <span className="text-sm">{label}</span>
                      </div>
                      <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-xl px-2"
                        aria-label="Close modal"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    {/* Task Title */}
                    <input
                      type="text"
                      className="w-full mb-3 border border-gray-300 rounded p-2 text-sm"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* Description */}
                    <textarea
                      className="w-full mb-3 border border-gray-300 rounded p-2 text-sm"
                      rows={4}
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />

                    {/* Label */}
                    <div className="mb-3">
                      <label className="text-sm font-medium block mb-1">
                        Label
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        value={label}
                        onChange={(e) => {
                          const selected = labelOptions.find(
                            (l) => l.value === e.target.value
                          );
                          setLabel(selected.value);
                          setLabelColor(selected.color);
                        }}
                      >
                        {labelOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Due Date */}
                    <div className="mb-4">
                      <label className="text-sm font-medium block mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                      />
                    </div>

                    {/* Comments */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold block mb-2">
                        Comments
                      </label>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {comments.map((c) => (
                          <div
                            key={c._id}
                            className="text-sm border rounded p-2"
                          >
                            <strong>{c.userId.name}</strong>{" "}
                            <span className="text-gray-500 text-xs">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                            <p className="mt-1">{c.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex mt-2 gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-1 border border-gray-300 rounded p-2 text-sm"
                          placeholder="Write a comment..."
                        />
                        <button
                          onClick={addComment}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold block mb-1">
                        Attachments
                      </label>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="text-sm mb-2"
                        disabled={uploading}
                      />
                      {uploading && (
                        <p className="text-gray-500 text-sm">Uploading...</p>
                      )}
                      <ul className="space-y-1 text-sm max-h-32 overflow-y-auto mt-1 text-sm">
                        {task.attachments?.map((att, i) => (
                          <li key={i}>
                            <PaperClipIcon className="inline h-4 w-4 text-gray-500 mr-1" />
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

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdate}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        disabled={uploading}
                      >
                        Save Changes
                      </button>
                      {uploading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                          Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default TaskModal;

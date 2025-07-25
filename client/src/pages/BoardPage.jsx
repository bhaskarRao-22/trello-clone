import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import socket from "../socket";
import InviteForm from "../components/InviteForm";
import AdminActivityLog from "../components/AdminActivityLog";
import TeamMembers from "../components/TeamMembers";
import {
  XMarkIcon,
  DocumentPlusIcon,
  PaperClipIcon,
  EnvelopeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { motion } from "framer-motion";

function BoardPage() {
  const { id: boardId } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [invites, setInvites] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});
  const [newListTitle, setNewListTitle] = useState("");
  const [taskInputs, setTaskInputs] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // const currentUserRole = board?.team?.find(
  //   (member) => member.userId?._id === user._id
  // )?.role;

  const currentUserRole = useMemo(() => {
    return board?.team?.find((member) => member.userId?._id === user._id)?.role;
  }, [board, user]);

  const canEdit = currentUserRole === "Admin" || currentUserRole === "Editor";

  const fetchLists = async () => {
    try {
      const res = await API.get(`/lists/${boardId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLists(res.data);
    } catch (err) {
      alert("Error fetching lists");
    }
  };

  const fetchTasks = async (listId) => {
    try {
      const res = await API.get(`/tasks/${listId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks((prev) => ({ ...prev, [listId]: res.data }));
    } catch (err) {
      alert("Error fetching tasks");
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListTitle) return;
    try {
      await API.post(
        "/lists",
        { title: newListTitle, boardId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNewListTitle("");
      await fetchLists();
    } catch (err) {
      console.log(err);
      alert("List creation failed");
    }
  };

  const createTask = async (listId) => {
    const title = taskInputs[listId];
    if (!title) return;

    try {
      await API.post(
        "/tasks",
        { title, listId, boardId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTaskInputs((prev) => ({ ...prev, [listId]: "" }));
      fetchTasks(listId);
    } catch (err) {
      alert("Task creation failed");
    }
  };

  const reorderTasks = (source, destination, draggableId) => {
    const updated = [];

    if (source.droppableId === destination.droppableId) {
      const list = [...tasks[source.droppableId]];
      const [moved] = list.splice(source.index, 1);
      list.splice(destination.index, 0, moved);
      updated.push(
        ...list.map((task, index) => ({
          ...task,
          order: index,
        }))
      );
    } else {
      const srcList = [...tasks[source.droppableId]];
      const destList = [...tasks[destination.droppableId]];

      const [moved] = srcList.splice(source.index, 1);
      moved.listId = destination.droppableId;
      destList.splice(destination.index, 0, moved);

      updated.push(
        ...srcList.map((t, i) => ({ ...t, order: i })),
        ...destList.map((t, i) => ({ ...t, order: i }))
      );
    }
    return updated;
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const updated = reorderTasks(source, destination, draggableId);
    const grouped = updated.reduce((acc, task) => {
      acc[task.listId] = acc[task.listId] || [];
      acc[task.listId].push(task);
      return acc;
    }, {});
    setTasks(grouped);

    try {
      await API.put(
        "/tasks/reorder",
        {
          updatedTasks: updated.map(({ _id, listId, order }) => ({
            _id,
            listId,
            order,
          })),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      alert("Failed to update task order");
    }
  };

  useEffect(() => {
    fetchLists();
  }, [boardId]);

  useEffect(() => {
    socket.emit("joinBoard", boardId);

    return () => {
      socket.emit("leaveBoard", boardId);
    };
  }, [boardId]);

  useEffect(() => {
    lists.forEach((list) => fetchTasks(list._id));
  }, [lists]);

  useEffect(() => {
    const handleTaskUpdated = ({ taskId }) => {
      lists.forEach((list) => {
        fetchTasks(list._id);
      });
    };

    socket.on("taskUpdated", handleTaskUpdated);
    return () => {
      socket.off("taskUpdated", handleTaskUpdated);
    };
  }, [lists]);

  useEffect(() => {
    const fetchBoard = async () => {
      const res = await API.get(`/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBoard(res.data);
      // console.log(res.data);
    };

    fetchBoard();
  }, [boardId]);

  useEffect(() => {
    const fetchInvites = async () => {
      const res = await API.get(`/boards/${boardId}/invites`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setInvites(res.data);
      console.log("Invites Fetched:", res.data);
    };

    if (currentUserRole === "Admin") fetchInvites();
  }, [currentUserRole]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-50 to-white p-6 pt-18 overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            📋 {board?.title || "Board Workspace"}
          </h1>

          {/* Team Members */}
          <TeamMembers board={board} />
        </div>

        {/* Lists Section */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 min-h-[50vh]">
            {lists.map((list) => (
              <div
                key={list._id}
                className="w-72 bg-white p-4 rounded-xl shadow-md border border-gray-200 flex-shrink-0"
              >
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {list.title}
                </h2>

                {/* Tasks inside Droppable */}
                <Droppable
                  droppableId={list._id}
                  isDropDisabled={!canEdit}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                >
                  {(provided) => (
                    <div
                      className="space-y-2 min-h-[60px]"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {(tasks[list._id] || [])
                        .sort((a, b) => a.order - b.order)
                        .map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                onClick={() => setSelectedTask(task)}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-md cursor-pointer shadow-sm transition"
                              >
                                <div className="text-sm font-medium">
                                  {task.title}
                                </div>
                                {task.label !== "None" && (
                                  <div
                                    className="inline-block text-xs text-white px-2 py-0.5 mt-1 rounded"
                                    style={{ backgroundColor: task.labelColor }}
                                  >
                                    {task.label}
                                  </div>
                                )}
                                {task.dueDate && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    📅{" "}
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task Input */}
                {canEdit && (
                  <>
                    <input
                      type="text"
                      placeholder="➕ New Task"
                      value={taskInputs[list._id] || ""}
                      onChange={(e) =>
                        setTaskInputs((prev) => ({
                          ...prev,
                          [list._id]: e.target.value,
                        }))
                      }
                      className="w-full mt-3 p-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => createTask(list._id)}
                      className="w-full mt-2 bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm"
                    >
                      Add Task
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* New List Form */}
            {canEdit && (
              <form
                onSubmit={createList}
                className="w-72 bg-blue-50 border border-dashed border-blue-300 p-4 rounded-xl shadow-md flex-shrink-0"
              >
                <input
                  type="text"
                  placeholder="📝 New List Title"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded text-sm"
                />
                <button className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm">
                  Add List
                </button>
              </form>
            )}
          </div>
        </DragDropContext>

        {/* Other Sections */}
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            token={user.token}
            onUpdate={(updatedTask) => {
              setTasks((prev) => {
                const updatedTasks = { ...prev };
                const listTasks = updatedTasks[updatedTask.listId] || [];
                updatedTasks[updatedTask.listId] = listTasks.map((t) =>
                  t._id === updatedTask._id ? updatedTask : t
                );
                return updatedTasks;
              });
            }}
          />
        )}

        {/* Pending Invites */}
        {invites?.length > 0 && (
          <div className="mt-6">
            <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-4">
              <EnvelopeIcon className="w-6 h-6 text-blue-500 mr-2" />
              Pending Invites
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {invites.map((inv) => (
                <motion.div
                  key={inv._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-200 rounded-tl-xl rounded-bl-xl"></div>

                  <div className="flex items-center gap-4 ml-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg rounded-full">
                      {inv.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 truncate">
                        {inv.email}
                      </p>
                      <p className="text-xs uppercase text-blue-500 mt-1">
                        {inv.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Activity Log */}
        {currentUserRole === "Admin" && (
          <div className="mt-6">
            <AdminActivityLog boardId={boardId} token={user.token} />
          </div>
        )}

        {currentUserRole === "Admin" && (
          <InviteForm boardId={boardId} token={user.token} />
        )}
      </div>
    </>

    // <div className="min-h-screen bg-blue-50 p-6 overflow-x-auto">
    //   <h1 className="text-2xl font-bold mb-4">Board Workspace</h1>

    //   <DragDropContext onDragEnd={onDragEnd}>
    //     <div className="flex gap-4 pb-4">
    //       {lists.map((list) => (
    //         <div key={list._id} className="w-64 bg-white p-3 rounded-xl shadow">
    //           <h2 className="font-semibold text-lg mb-3">{list.title}</h2>

    //           {/* Render tasks */}
    //           <Droppable
    //             droppableId={list._id}
    //             isDropDisabled={!canEdit}
    //             isCombineEnabled={false}
    //             ignoreContainerClipping={false}
    //           >
    //             {(provided) => (
    //               <div
    //                 className="space-y-2 mb-3 min-h-[50px]"
    //                 ref={provided.innerRef}
    //                 {...provided.droppableProps}
    //               >
    //                 {(tasks[list._id] || [])
    //                   .sort((a, b) => a.order - b.order)
    //                   .map((task, index) => (
    //                     <Draggable
    //                       key={task._id}
    //                       draggableId={task._id}
    //                       index={index}
    //                     >
    //                       {(provided) => (
    //                         <div
    //                           onClick={() => setSelectedTask(task)}
    //                           className="p-2 bg-gray-100 rounded shadow cursor-pointer hover:bg-gray-200"
    //                           ref={provided.innerRef}
    //                           {...provided.draggableProps}
    //                           {...provided.dragHandleProps}
    //                         >
    //                           <div className="flex flex-col gap-1">
    //                             <div className="text-sm font-medium">
    //                               {task.title}
    //                             </div>
    //                             {task.label !== "None" && (
    //                               <span
    //                                 className="inline-block px-2 py-0.5 rounded text-xs text-white w-fit"
    //                                 style={{ backgroundColor: task.labelColor }}
    //                               >
    //                                 {task.label}
    //                               </span>
    //                             )}
    //                             {task.dueDate && (
    //                               <span className="text-[11px] text-gray-500">
    //                                 Due:{" "}
    //                                 {new Date(
    //                                   task.dueDate
    //                                 ).toLocaleDateString()}
    //                               </span>
    //                             )}
    //                           </div>
    //                         </div>
    //                       )}
    //                     </Draggable>
    //                   ))}
    //                 {provided.placeholder}
    //               </div>
    //             )}
    //           </Droppable>

    //           {/* Add task */}
    //           <input
    //             type="text"
    //             placeholder="New task..."
    //             value={taskInputs[list._id] || ""}
    //             onChange={(e) =>
    //               setTaskInputs((prev) => ({
    //                 ...prev,
    //                 [list._id]: e.target.value,
    //               }))
    //             }
    //             className="w-full p-1 border rounded mb-2"
    //             disabled={!canEdit}
    //           />
    //           {canEdit && (
    //             <button
    //               onClick={() => createTask(list._id)}
    //               className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm"
    //             >
    //               Add Task
    //             </button>
    //           )}
    //         </div>
    //       ))}

    //       {/* Create New List */}
    //       {canEdit && (
    //         <form
    //           onSubmit={createList}
    //           className="w-64 bg-gray-100 p-3 rounded-xl shadow"
    //         >
    //           <input
    //             type="text"
    //             placeholder="New List Title"
    //             value={newListTitle}
    //             onChange={(e) => setNewListTitle(e.target.value)}
    //             className="w-full mb-2 p-2 border rounded"
    //           />
    //           <button className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700">
    //             Add List
    //           </button>
    //         </form>
    //       )}
    //     </div>
    //   </DragDropContext>

    //   {selectedTask && (
    //     <TaskModal
    //       task={selectedTask}
    //       onClose={() => setSelectedTask(null)}
    //       token={user.token}
    //       onUpdate={(updatedTask) => {
    //         // Update task in state
    //         setTasks((prev) => {
    //           const newTasks = { ...prev };
    //           const list = newTasks[updatedTask.listId] || [];
    //           newTasks[updatedTask.listId] = list.map((t) =>
    //             t._id === updatedTask._id ? updatedTask : t
    //           );
    //           return newTasks;
    //         });
    //       }}
    //     />
    //   )}

    //   {currentUserRole === "Admin" && (
    //     <InviteForm boardId={boardId} token={user.token} />
    //   )}

    //   {invites?.length > 0 && (
    //     <div className="mt-4 bg-yellow-50 p-3 rounded">
    //       <h3 className="font-semibold">Pending Invites</h3>
    //       <ul className="text-sm">
    //         {invites.map((inv) => (
    //           <li key={inv._id}>
    //             📨 {inv.email} – {inv.role}
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //   )}

    //   {board?.team?.length > 0 && (
    //     <div className="bg-white shadow rounded p-3 mt-4 w-fit">
    //       <h3 className="font-bold mb-2">Team Members</h3>
    //       <ul className="text-sm">
    //         {board.team.map((member, index) => (
    //           <li key={member.userId?._id || index}>
    //             👤 {member.userId?.name || "Unknown User"} –{" "}
    //             <strong>{member.role}</strong>
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //   )}

    //   {currentUserRole === "Admin" && (
    //     <AdminActivityLog boardId={boardId} token={user.token} />
    //   )}
    // </div>
  );
}

export default BoardPage;

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskModal from "../components/TaskModal";
import socket from "../socket";
import AdminActivityLog from "../components/AdminActivityLog";

function BoardPage() {
  const { id: boardId } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({}); // key: listId, value: array of tasks
  const [newListTitle, setNewListTitle] = useState("");
  const [taskInputs, setTaskInputs] = useState({}); // input for each list
  const [selectedTask, setSelectedTask] = useState(null);

  const currentUserRole = board?.team?.find(
    (member) => member.user._id === user._id
  )?.role;

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
      alert("List creation failed");
    }
  };

  const createTask = async (listId) => {
    const title = taskInputs[listId];
    if (!title) return;

    try {
      await API.post(
        "/tasks",
        { title, listId },
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

    // Recreate order for source and destination
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

    // Save to backend
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
      // Optionally re-fetch or update task in place
      lists.forEach((list) => {
        fetchTasks(list._id); // or just update specific one
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
    };

    fetchBoard();
  }, [boardId]);

  return (
    <div className="min-h-screen bg-blue-50 p-6 overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Board Workspace</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <div key={list._id} className="w-64 bg-white p-3 rounded-xl shadow">
              <h2 className="font-semibold text-lg mb-3">{list.title}</h2>

              {/* Render tasks */}
              <Droppable droppableId={list._id}>
                {(provided) => (
                  <div
                    className="space-y-2 mb-3 min-h-[50px]"
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
                              className="p-2 bg-gray-100 rounded shadow cursor-pointer hover:bg-gray-200"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium">
                                  {task.title}
                                </div>
                                {task.label !== "None" && (
                                  <span
                                    className="inline-block px-2 py-0.5 rounded text-xs text-white w-fit"
                                    style={{ backgroundColor: task.labelColor }}
                                  >
                                    {task.label}
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span className="text-[11px] text-gray-500">
                                    Due:{" "}
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add task */}
              <input
                type="text"
                placeholder="New task..."
                value={taskInputs[list._id] || ""}
                onChange={(e) =>
                  setTaskInputs((prev) => ({
                    ...prev,
                    [list._id]: e.target.value,
                  }))
                }
                className="w-full p-1 border rounded mb-2"
                disabled={!canEdit}
              />
              {canEdit && (
                <button
                  onClick={() => createTask(list._id)}
                  className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm"
                >
                  Add Task
                </button>
              )}
            </div>
          ))}

          {/* Create New List */}
          {canEdit && (
            <form
              onSubmit={createList}
              className="w-64 bg-gray-100 p-3 rounded-xl shadow"
            >
              <input
                type="text"
                placeholder="New List Title"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              />
              <button className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700">
                Add List
              </button>
            </form>
          )}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          token={user.token}
          onUpdate={(updatedTask) => {
            // Update task in state
            setTasks((prev) => {
              const newTasks = { ...prev };
              const list = newTasks[updatedTask.listId] || [];
              newTasks[updatedTask.listId] = list.map((t) =>
                t._id === updatedTask._id ? updatedTask : t
              );
              return newTasks;
            });
          }}
        />
      )}

      {board?.team?.length > 0 && (
        <div className="bg-white shadow rounded p-3 mt-4 w-fit">
          <h3 className="font-bold mb-2">Team Members</h3>
          <ul className="text-sm">
            {board.team.map((member) => (
              <li key={member.user._id}>
                👤 {member.user.name} – <strong>{member.role}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentUserRole === "Admin" && (
        <AdminActivityLog boardId={boardId} token={user.token} />
      )}
    </div>
  );
}

export default BoardPage;

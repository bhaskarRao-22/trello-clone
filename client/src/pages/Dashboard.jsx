import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");

  const fetchBoards = async () => {
    try {
      const res = await API.get("/boards", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBoards(res.data);
    } catch (err) {
      alert("Error fetching boards");
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await API.post(
        "/boards",
        { title },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTitle("");
      fetchBoards();
    } catch (err) {
      alert("Board creation failed");
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Your Boards</h1>

      <form onSubmit={createBoard} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New Board Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-4 py-2 rounded w-64"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board._id}
            className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-blue-50"
            onClick={() => navigate(`/board/${board._id}`)}
          >
            <h2 className="text-lg font-semibold">{board.title}</h2>
            <p className="text-sm text-gray-500">
              Created on {new Date(board.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

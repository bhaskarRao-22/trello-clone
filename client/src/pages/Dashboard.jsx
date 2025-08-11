import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

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
      // console.log("Boards fetched:", res.data);
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
    <>
      <div className="flex">
        {/* <div className="min-h-screen p-6 bg-gray-100"> */}
        <Sidebar />
        <main className="flex-1 bg-gradient-to-b from-blue-100 via-blue-50 to-white p-6 pt-14 sm:pt-6 overflow-x-auto h-[calc(100vh-4rem)] overflow-y-auto">
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
            {boards.length === 0 ? (
              <p>No boards found. Create your first board above!</p>
            ) : (
              boards.map((board) => (
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
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;

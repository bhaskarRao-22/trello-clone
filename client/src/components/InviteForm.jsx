import { useState } from "react";
import API from "../api/axios";

function InviteForm({ boardId, token }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [message, setMessage] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(
        `/boards/${boardId}/invite`,
        { email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.msg);
      setEmail("");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error inviting user");
    }
  };

  return (
    <div className="border rounded p-4 bg-white shadow">
      <h3 className="font-semibold mb-2">Invite Team Member</h3>
      <form onSubmit={handleInvite} className="space-y-2">
        <input
          type="email"
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="Viewer">Viewer</option>
          <option value="Editor">Editor</option>
          <option value="Admin">Admin</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Invite
        </button>
      </form>
      {message && <p className="text-sm mt-2 text-green-600">{message}</p>}
    </div>
  );
}

export default InviteForm;

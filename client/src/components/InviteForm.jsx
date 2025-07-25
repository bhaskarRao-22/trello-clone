import { useState } from "react";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

function InviteForm({ boardId, token }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(
        `/boards/${boardId}/invite`,
        { email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.msg);
      setEmail("");
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.msg || "Error inviting user");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative w-80 h-14">
        {/* Floating Icon Button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="group fixed bottom-6 right-6 flex items-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out overflow-hidden hover:pr-4"
        >
          <div className="w-14 h-14 flex items-center justify-center">
            <DocumentPlusIcon className="w-7 h-7" />
          </div>
          <span className="max-w-0 group-hover:max-w-xs opacity-0 group-hover:opacity-100 ml-0 transition-all duration-300 text-sm whitespace-nowrap">
            Invite Team
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute bottom-16 right-0 w-80 backdrop-blur-2xs backdrop-saturate-150 bg-white/70 shadow-lg rounded-lg overflow-hidden z-10 border border-white/30"
            >
              <div className="flex justify-between items-center px-4 py-2 bg-blue-600 text-white">
                <h4 className="font-semibold">Invite Team</h4>
                <button onClick={() => setOpen(false)}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
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
                {message && (
                  <p className="text-sm mt-2 text-green-600">{message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InviteForm;

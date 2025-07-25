import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TeamMembers = ({ board }) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [expanded]);
  if (!board?.team?.length) return null;

  return (
    <div className="fixed top-18 right-6 z-50">
      {/* Collapsed view */}
      {!expanded && (
        <div
          onClick={() => setExpanded(true)}
          className="flex items-center cursor-pointer bg-white shadow-md rounded-full px-4 py-2"
        >
          <div className="flex -space-x-4">
            {board.team.slice(0, 5).map((member) => (
              <div
                key={member.userId._id}
                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold border-2 border-white"
                title={member.userId.name}
              >
                {member.userId.name.charAt(0)}
              </div>
            ))}
            {board.team.length > 5 && (
              <div className="w-10 h-10 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white">
                +{board.team.length - 5}
              </div>
            )}
          </div>
          <span className="ml-3 text-sm text-gray-700">Team</span>
        </div>
      )}

      {/* Expanded view */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="sticky top-0 left-0 right-0 bg-purple-200/20 transition-opacity backdrop-blur-sm shadow-xl rounded-full border-b border-red-200 z-50 h-15 flex items-center px-6"
          >
            <h3 className="text-base font-semibold mb-1">👥 Team Members</h3>
            {/* Close button */}
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-0 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>

            {/* Members */}
            <div className="flex items-center space-x-6">
              {board.team.map((member) => (
                <div
                  key={member.userId._id}
                  className="flex flex-col items-center justify-center"
                >
                  <div
                    className={`w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center text-md font-semibold
                    ${member.role === "Admin" ? "bg-red-600" : "bg-blue-600"}
                    `}
                  >
                    {member.userId.name.charAt(0)}
                  </div>
                  <p
                    className={`text-xs mt-1 text-center w-16 truncate
                    ${
                      member.role === "Admin"
                        ? "text-red-600 font-bold"
                        : "text-gray-700"
                    }
                    `}
                  >
                    {member.userId.name}
                  </p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMembers;

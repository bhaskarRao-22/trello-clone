import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TeamMembers = ({ board }) => {
  const [expanded, setExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [expanded]);

  if (!board?.team?.length) return null;

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setExpanded(!expanded);
  };

  return (
    <div className="fixed top-2 right-6 z-20">
      <AnimatePresence mode="popLayout">
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.15 },
            }}
            onAnimationComplete={() => setIsAnimating(false)}
            onClick={handleToggle}
            className="flex items-center cursor-pointer bg-white/90 shadow-lg rounded-full px-4 py-2 backdrop-blur-sm border border-gray-200 hover:shadow-xl transition-all"
          >
            <div className="flex -space-x-3">
              {board.team.slice(0, 5).map((member) => (
                <motion.div
                  key={member.userId._id}
                  whileHover={{ scale: 1.1, zIndex: 1 }}
                  className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm"
                  title={`${member.userId.name} (${member.role})`}
                >
                  {member.userId.name.charAt(0)}
                </motion.div>
              ))}
              {board.team.length > 5 && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white shadow-sm"
                >
                  +{board.team.length - 5}
                </motion.div>
              )}
            </div>
            <motion.span
              whileTap={{ scale: 0.95 }}
              className="ml-3 text-sm text-gray-700 font-medium"
            >
              Team
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }}
            exit={{
              opacity: 0,
              x: 50,
              transition: { duration: 0.15 },
            }}
            onAnimationComplete={() => setIsAnimating(false)}
            className="bg-white/90 backdrop-blur-sm shadow-xl rounded-full border border-gray-200 flex items-center px-6 max-w-[90vw]"
          >
            <motion.h3
              className="text-base font-semibold mr-4 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 } }}
            >
              👥 Team Members
            </motion.h3>

            <div className="flex items-center  pt-1 scrollbar-hide">
              {board.team.map((member, index) => (
                <motion.div
                  key={member.userId._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                    },
                  }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center justify-center shrink-0 px-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-lg font-bold shadow-md
                    ${
                      member.role === "Admin"
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : "bg-gradient-to-br from-blue-500 to-blue-600"
                    }
                    `}
                  >
                    {member.userId.name.charAt(0)}
                  </div>
                  <p
                    className={`text-xs mt-1.5 text-center max-w-[4.5rem] truncate
                    ${
                      member.role === "Admin"
                        ? "text-red-600 font-bold"
                        : "text-gray-700"
                    }
                    `}
                  >
                    {member.userId.name}
                  </p>
                  <p className="text-[0.65rem] text-gray-500 font-medium mt-0.5">
                    {member.role}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggle}
              className="ml-4 text-gray-500 hover:text-red-500 text-xl font-bold shrink-0"
              aria-label="Close team view"
            >
              &times;
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMembers;

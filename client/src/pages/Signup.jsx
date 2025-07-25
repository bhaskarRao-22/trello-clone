import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const transitionConfig = { duration: 0.8, ease: "easeOut" };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, password });
      const res = await API.post("/auth/login", { email, password }); // Auto-login after signup
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-100">
    //   <form
    //     className="bg-white p-6 rounded-xl shadow-md w-80"
    //     onSubmit={handleSignup}
    //   >
    //     <h2 className="text-xl font-bold mb-4">Signup</h2>
    //     <input
    //       type="text"
    //       className="mb-3 w-full p-2 border rounded"
    //       placeholder="Name"
    //       value={name}
    //       onChange={(e) => setName(e.target.value)}
    //     />
    //     <input
    //       type="email"
    //       className="mb-3 w-full p-2 border rounded"
    //       placeholder="Email"
    //       autoComplete="username"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //     />
    //     <input
    //       type="password"
    //       className="mb-4 w-full p-2 border rounded"
    //       placeholder="Password"
    //       name="password"
    //       autoComplete="current-password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //     />
    //     <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
    //       Signup
    //     </button>
    //   </form>
    // </div>

    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      {/* Main Container */}

      <div className="relative w-full max-w-[750px] h-auto md:h-[450px] border-1 border-black rounded-xl shadow-[0_0_20px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-xs flex flex-col md:flex-row">
        {/* White Rotating Background (Right Side) */}
        <div className="hidden md:block absolute top-0 right-[-100px] w-[850px] h-[700px] bg-radial-[at_50%_75%] from-sky-200 via-blue-400 to-indigo-900 to-90% transform rotate-[-16deg] skew-y-[-40deg] origin-[bottom_left] z-0" />

        {/* Signup Form (Right Side) */}
        <div className="responsive-position right-0 w-full md:w-1/2 h-full flex flex-col justify-center md:p-6 p-10 z-10">
          <motion.h2
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitionConfig}
            className="text-2xl md:text-3xl font-bold text-center mb-4 relative"
          >
            Sign Up
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-10 h-1 bg-black" />
          </motion.h2>

          <form onSubmit={handleSignup}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitionConfig}
              className="relative my-4"
            >
              <input
                type="text"
                className="w-full py-3 bg-transparent border-b-2 border-black outline-none focus:border-[#17a] transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label
                className={`absolute left-0 ${
                  name
                    ? "top-[-5px] text-[#17a]"
                    : "top-1/2 transform -translate-y-1/2"
                } transition-all pointer-events-none`}
              >
                Name
              </label>
              <FaUser className="absolute top-1/2 right-0 transform -translate-y-1/2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitionConfig}
              className="relative my-4"
            >
              <input
                type="email"
                className="w-full py-3 bg-transparent border-b-2 border-black outline-none focus:border-[#17a] transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label
                className={`absolute left-0 ${
                  email
                    ? "top-[-5px] text-[#17a]"
                    : "top-1/2 transform -translate-y-1/2"
                } transition-all pointer-events-none`}
              >
                Email
              </label>
              <FaEnvelope className="absolute top-1/2 right-0 transform -translate-y-1/2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitionConfig}
              className="relative my-4"
            >
              <input
                type="password"
                className="w-full py-3 bg-transparent border-b-2 border-black outline-none focus:border-[#17a] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label
                className={`absolute left-0 ${
                  password
                    ? "top-[-5px] text-[#17a]"
                    : "top-1/2 transform -translate-y-1/2"
                } transition-all pointer-events-none`}
              >
                Password
              </label>
              <FaLock className="absolute top-1/2 right-0 transform -translate-y-1/2" />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={transitionConfig}
              type="submit"
              className="w-full py-3 bg-sky-800 hover:bg-sky-700 text-white rounded-full font-semibold mt-6 hover:shadow-lg transition-all"
            >
              Sign Up
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transitionConfig}
            className="text-center mt-6"
          >
            Already have an account?{" "}
            <Link
              to="/"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </motion.p>
        </div>

        {/* Welcome Text (Left Side) */}
        <div className="absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center p-16 text-left text-black">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitionConfig}
            className="text-4xl uppercase leading-tight"
          >
            Join Us!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitionConfig}
            className="mt-4"
          >
            Start your journey with us today.
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

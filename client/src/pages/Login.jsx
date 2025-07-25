import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const transitionConfig = { duration: 0.8, ease: "easeOut" };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-100">
    //   <form
    //     className="bg-white p-6 rounded-xl shadow-md w-80"
    //     onSubmit={handleLogin}
    //   >
    //     <h2 className="text-xl font-bold mb-4">Login</h2>
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
    //       name="password"
    //       className="mb-4 w-full p-2 border rounded"
    //       placeholder="Password"
    //       autoComplete="current-password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //     />
    //     <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
    //       Login
    //     </button>
    //   </form>
    // </div>

    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      {/* Main Container */}
      <div className="relative w-full max-w-[750px] h-auto md:h-[450px] border-1 border-black rounded-xl shadow-[0_0_20px_rgba(113,113,113,1)] overflow-hidden backdrop-blur-xs flex flex-col md:flex-row">
        {/* Black Rotating Background (Left Side) */}
        <div className="hidden md:block absolute top-[-4px] left-0 w-[850px] h-[750px] bg-radial-[at_50%_75%] from-sky-200 via-blue-400 to-indigo-900 to-90% transform rotate-[11deg] skew-y-[40deg] origin-[bottom_right] z-0" />

        {/* Login Form (Left Side) */}
        <div className="relative w-full md:w-1/2 h-full flex flex-col justify-center p-6 md:p-10 z-10">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitionConfig}
            className="text-2xl md:text-3xl font-bold text-center mb-4 relative"
          >
            Login
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-10 h-1 bg-black" />
          </motion.h2>

          <form onSubmit={handleLogin}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitionConfig}
              className="relative my-6"
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
              <FaUser className="absolute top-1/2 right-0 transform -translate-y-1/2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitionConfig}
              className="relative my-6"
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
              Login
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transitionConfig}
            className="text-center mt-6"
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </motion.p>
        </div>

        {/* Welcome Text (Right Side) */}
        <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center p-16 text-right text-black">
          <motion.h2
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitionConfig}
            className="text-4xl uppercase leading-tight text-nowrap"
          >
            Welcome Back!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitionConfig}
            className="mt-4"
          >
            Let’s get you in.
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default Login;

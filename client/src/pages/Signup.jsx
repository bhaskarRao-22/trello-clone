import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-6 rounded-xl shadow-md w-80"
        onSubmit={handleSignup}
      >
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        <input
          type="text"
          className="mb-3 w-full p-2 border rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="mb-3 w-full p-2 border rounded"
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="mb-4 w-full p-2 border rounded"
          placeholder="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;

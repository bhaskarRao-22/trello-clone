import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BoardPage from "./pages/BoardPage";
import JoinInvite from "./pages/JoinInvite";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/board/:id" element={<BoardPage />} />
        <Route path="/join-invite/:token" element={<JoinInvite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

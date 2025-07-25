import { useParams, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function JoinInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("loading");
  const joinedRef = useRef(false);

  useEffect(() => {
    const join = async () => {
      if (joinedRef.current) return;
      joinedRef.current = true;

      try {
        const res = await API.put(
          `/invites/accept/${token}`,
          {},
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        alert(res.data.msg);
        navigate(`/boards/${res.data.boardId}`);
      } catch (err) {
        const errorMsg = err.response?.data?.msg || "Something went wrong.";
        setStatus(errorMsg);
      }
    };

    if (user?.token) {
      join();
    } else {
      setStatus("unauthenticated");
    }
  }, [token, user]);

  if (status === "unauthenticated") {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold">🔐 Please Login</h1>
        <p className="text-gray-600">
          You must be logged in to accept the invitation.
        </p>
        <a href="/login" className="text-blue-600 underline mt-2 inline-block">
          Go to Login
        </a>
      </div>
    );
  }

  if (status !== "loading") {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-red-600">❌ {status}</h1>
        <a href="/" className="text-blue-600 underline mt-2 inline-block">
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold">Joining Board...</h1>
      <p className="text-gray-600">
        Please wait while we process your invitation.
      </p>
    </div>
  );
}

export default JoinInvite;

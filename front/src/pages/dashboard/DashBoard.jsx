// src/pages/dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Check authentication and fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || accessToken === "undefined") {
          toast.error("You must be logged in");
          navigate("/login");
          return;
        }

        const res = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUser(res.data.user);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        <p className="text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-3xl font-semibold mb-4">
          Welcome, {user?.name} 👋
        </h2>
        <p className="text-lg">Email: {user?.email}</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You have successfully accessed a protected route.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

// src/pages/auth/ForgotPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "undefined") {
      navigate("/dashboard");
    }
  }, [navigate]);

  // 🛠 Validate email
  const validateEmail = () => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address");
      return false;
    }
    return true;
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Password reset email sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-md">
        <h2 className="text-3xl font-semibold text-center mb-6 dark:text-white">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

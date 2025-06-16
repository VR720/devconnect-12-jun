// src/pages/auth/Verify.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        toast.success(res.data.message || "Email verified successfully!");
        navigate("/login");
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Email verification failed."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-md text-center">
        <h2 className="text-3xl font-semibold mb-6 dark:text-white">
          Verifying Email...
        </h2>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we verify your email.
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            Redirecting you to login page.
          </p>
        )}
      </div>
    </div>
  );
};

export default Verify;

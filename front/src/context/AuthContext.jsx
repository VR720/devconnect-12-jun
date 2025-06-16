import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => {
    const stored = localStorage.getItem("accessToken");
    return stored && stored !== "undefined" && stored !== "null"
      ? stored
      : null;
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interceptor: refresh token on 401 errors with expired JWT
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "";

        if (
          status === 401 &&
          !originalRequest._retry &&
          message.toLowerCase().includes("jwt")
        ) {
          originalRequest._retry = true;
          try {
            const res = await api.post(
              "/auth/refresh-token",
              {},
              { withCredentials: true }
            );
            const newAccessToken = res.data.accessToken;

            setAccessToken(newAccessToken);
            localStorage.setItem("accessToken", newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest); // Retry original request
          } catch (refreshErr) {
            console.error("❌ Refresh token failed:", refreshErr);
            logout(); // Clear everything if refresh fails
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const getCurrentUser = async () => {
    const token = accessToken || localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") {
      logout(); // Clean state if token is missing
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setUser(res.data.user);

      // Only update token if new one is provided
      if (res.data.accessToken) {
        setAccessToken(res.data.accessToken);
        localStorage.setItem("accessToken", res.data.accessToken);
      }
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
      logout(); // Invalid token — log out
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    getCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const { user, accessToken } = res.data;

      setUser(user);
      setAccessToken(accessToken);
      localStorage.setItem("accessToken", accessToken);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, getCurrentUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };

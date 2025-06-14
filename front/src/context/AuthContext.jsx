import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return token && token !== "undefined" ? token : null;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    const token = accessToken || localStorage.getItem("accessToken");
    console.log("🔍 Checking current user with token:", token);

    if (!token || token === "undefined" || token === "null") {
      console.warn("❌ Invalid token on load");
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
      setAccessToken(res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
    } catch (err) {
      console.error("❌ /auth/me failed:", err.response?.data || err.message);
      const msg = err.response?.data?.message?.toLowerCase() || "";

      if (msg.includes("jwt")) {
        console.warn("Removing invalid/malformed JWT");
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, accessToken } = res.data;

      if (!accessToken || typeof accessToken !== "string") {
        throw new Error("Invalid access token received from server.");
      }

      setUser(user);
      setAccessToken(accessToken);
      localStorage.setItem("accessToken", accessToken);

      console.log("✅ Login success:", user);
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login error");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("❌ Logout failed:", err.response?.data || err.message);
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
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

// Create context
const AuthContext = createContext();

// Create provider
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on load
  const getCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me"); // This should return user info
      setUser(res.data.user);
      setAccessToken(res.data.accessToken);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
  };

  // Logout function
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, getCurrentUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

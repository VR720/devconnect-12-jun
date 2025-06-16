import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Request: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: refresh access token if expired
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      err.response.data?.message?.toLowerCase().includes("jwt")
    ) {
      originalRequest._retry = true;

      try {
        const refreshRes = await api.post(
          "/auth/refresh-token", // 🔥 FIXED
          {},
          { withCredentials: true }
        );
        const newAccessToken = refreshRes.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token failed:", refreshError);
        localStorage.removeItem("accessToken");
        window.dispatchEvent(new Event("forceLogout"));
      }
    }

    return Promise.reject(err);
  }
);

// localStorage.getItem("accessToken")

export default api;

import axios from "axios";

export const BASE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://resumeiq-backend-d7s5.onrender.com";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${BASE_SERVER_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to all requests if present in sessionStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

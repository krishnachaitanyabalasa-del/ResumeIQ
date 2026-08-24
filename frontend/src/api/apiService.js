import axiosInstance from "./axiosInstance";

// Authentication & Account API endpoints
export const authApi = {
  // Candidate Registration
  registerUser: (userData) => axiosInstance.post("/auth/register", userData),

  // Candidate Login
  loginUser: (credentials) => axiosInstance.post("/auth/login", credentials),

  // Admin Registration
  registerAdmin: (adminData) => axiosInstance.post("/admin", adminData),

  // Admin Login
  loginAdmin: (credentials) => axiosInstance.post("/admin/login", credentials),

  // Get Candidate Profile
  getUserProfile: (userId) => axiosInstance.get(`/users/${userId}`),

  // Get Admin Profile
  getAdminProfile: (adminId) => axiosInstance.get(`/admin/${adminId}`),
};

export default authApi;

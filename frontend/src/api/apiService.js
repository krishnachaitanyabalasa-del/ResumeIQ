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

  // Drives API
  getMyDrives: () => axiosInstance.get("/drives/my-drives"),

  getMyDriveStats: () => axiosInstance.get("/drives/my-drives/stats"),

  getDriveById: (driveId) => axiosInstance.get(`/drives/${driveId}`),

  updateDrive: (driveId, driveData) => axiosInstance.put(`/drives/${driveId}`, driveData),

  createDrive: (formData) =>
    axiosInstance.post("/drives", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Applications API
  getApplicationsByDrive: (driveId) => axiosInstance.get(`/applications/drive/${driveId}`),
};

export default authApi;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";
import RegisterUser from "./User/RegisterUser";
import RegisterAdmin from "./Admin/RegisterAdmin";

import UserHomePage from "./User/UserHomePage";
import UserDriveDetails from "./User/UserDriveDetails";
import ApplyDrive from "./User/ApplyDrive";
import AdminHome from "./Admin/AdminHome";
import CreateDrive from "./Admin/CreateDrive";
import DriveDetails from "./Admin/DriveDetails";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />

        {/* User / Applicant Routes */}
        <Route path="/user-home" element={<UserHomePage />} />
        <Route path="/user/drives/:driveId" element={<UserDriveDetails />} />
        <Route path="/user/apply/:driveId" element={<ApplyDrive />} />

        {/* Recruiter / Admin Routes */}
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/create-drive" element={<CreateDrive />} />
        <Route path="/admin/drives/:driveId" element={<DriveDetails />} />
      </Routes>
    </Router>
  );
}

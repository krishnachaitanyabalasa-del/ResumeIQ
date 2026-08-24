import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";
import RegisterUser from "./User/RegisterUser";
import RegisterAdmin from "./Admin/RegisterAdmin";

import UserHomePage from "./User/UserHomePage";
import AdminHome from "./Admin/AdminHome";
import CreateDrive from "./Admin/CreateDrive";
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

        {/* Recruiter / Admin Routes */}
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/create-drive" element={<CreateDrive />} />
      </Routes>
    </Router>
  );
}

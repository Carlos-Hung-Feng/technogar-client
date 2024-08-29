import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  let _isAutehticated = false;

  if (localStorage.getItem("token")) {
    const today = new Date().toLocaleDateString("en-US");
    if (localStorage.getItem("loginDate") === today) {
      _isAutehticated = true;
    }
  }

  return _isAutehticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

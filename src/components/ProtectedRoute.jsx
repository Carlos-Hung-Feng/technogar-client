import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  let _isAutehticated = localStorage.getItem("token") ? true : false;

  return _isAutehticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

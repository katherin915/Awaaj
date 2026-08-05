import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  // 🔐 If user not signed in, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  let role = 'user';
  try {
    const decoded = jwtDecode(token);
    role = decoded.role || 'user';
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }

  console.log("🔍 Authenticated User Role:", role);

  // ✅ Check role against allowedRoles
  if (!allowedRoles || allowedRoles.includes(role)) {
    return children;
  }

  // ❌ Role not allowed → redirect to /unauthorized
  return <Navigate to="/unauthorized" />;
};

export default PrivateRoute;

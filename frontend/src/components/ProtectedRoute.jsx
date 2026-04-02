import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps a route so only authenticated users can access it.
 * Optionally restricts to a specific role, e.g. role="artisan"
 */
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) return <Navigate to="/login" replace />;

  if (role && user.role !== role)
    return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
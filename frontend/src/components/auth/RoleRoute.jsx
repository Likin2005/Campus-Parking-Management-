import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui/Skeleton';

/**
 * RoleRoute.jsx - Role-Based Access Control (RBAC) Guard for Admin Routes.
 * UI/UX Principle: Nielsen #5 (Error Prevention) & Clear Access Hierarchy.
 * Non-admins receive an empathetic "No Access" page explaining permissions rather than cryptic 403 errors.
 */

export default function RoleRoute({ allowedRoles = ['Admin'], children }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/no-access" replace />;
  }

  return children;
}

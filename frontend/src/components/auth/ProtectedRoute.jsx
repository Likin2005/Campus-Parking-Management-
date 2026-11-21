import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui/Skeleton';

/**
 * ProtectedRoute.jsx - Route Guard ensuring authenticated user session.
 * UI/UX Principles:
 * - Nielsen #3 (User Control & Freedom): Preserves attempted route in location state
 *   so users are seamlessly returned to their intended action after logging in.
 * - Prevents Back-button leakage after session termination.
 */

export default function ProtectedRoute({ children }) {
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
    // Redirect to login while capturing where they were attempting to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

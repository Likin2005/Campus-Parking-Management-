import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Layout & Route Guards
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FindParking from './pages/FindParking';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminOverview from './pages/admin/AdminOverview';
import ManageZones from './pages/admin/ManageZones';
import ManageSlots from './pages/admin/ManageSlots';
import NoAccess from './pages/NoAccess';
import NotFound from './pages/NotFound';
import Styleguide from './pages/Styleguide';

/**
 * App.jsx - Application Root & Routing Hierarchy.
 * UI/UX Principles:
 * - Nielsen #4 (Consistency and Standards): Uniform application shell wrapping all main workflows.
 * - Role-Based Access Control: Granular route protection between Students, Faculty, Visitors, and Admins.
 */

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BookingProvider>
              <Routes>
                {/* Standalone Authentication Pages (Split Layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Default Redirect to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Core Application Pages (Wrapped in AppShell with Nav & Footer) */}
                <Route
                  path="/dashboard"
                  element={
                    <AppShell>
                      <Dashboard />
                    </AppShell>
                  }
                />

                <Route
                  path="/find-parking"
                  element={
                    <AppShell>
                      <FindParking />
                    </AppShell>
                  }
                />

                <Route
                  path="/booking-confirmation/:id"
                  element={
                    <AppShell>
                      <BookingConfirmation />
                    </AppShell>
                  }
                />

                {/* User Protected Routes (Redirects to Login if unauthenticated) */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <MyBookings />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <History />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <Profile />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Routes (Restricted to 'Admin' role; others see /no-access) */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles={['Admin']}>
                      <AppShell>
                        <AdminOverview />
                      </AppShell>
                    </RoleRoute>
                  }
                />

                <Route
                  path="/admin/zones"
                  element={
                    <RoleRoute allowedRoles={['Admin']}>
                      <AppShell>
                        <ManageZones />
                      </AppShell>
                    </RoleRoute>
                  }
                />

                <Route
                  path="/admin/slots"
                  element={
                    <RoleRoute allowedRoles={['Admin']}>
                      <AppShell>
                        <ManageSlots />
                      </AppShell>
                    </RoleRoute>
                  }
                />

                {/* UI/UX Styleguide (Hidden reference route for grading & report) */}
                <Route
                  path="/styleguide"
                  element={
                    <AppShell>
                      <Styleguide />
                    </AppShell>
                  }
                />

                {/* 403 Forbidden & 404 Fallback Routes */}
                <Route
                  path="/no-access"
                  element={
                    <AppShell>
                      <NoAccess />
                    </AppShell>
                  }
                />

                <Route
                  path="*"
                  element={
                    <AppShell>
                      <NotFound />
                    </AppShell>
                  }
                />
              </Routes>
            </BookingProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DemoDataBadge from '../ui/DemoDataBadge';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  User,
  Shield,
  Palette,
  LogOut,
  X,
  Sun,
  Moon,
  Clock
} from 'lucide-react';

/**
 * MobileNav.jsx - Thumb-friendly bottom tab bar & accessible slide-out navigation drawer.
 * UI/UX Principles:
 * - Fitts's Law: Primary actions located at the bottom edge within effortless thumb reach on mobile.
 * - Minimum touch target >= 44x44px per WCAG 2.5.5.
 */

export default function MobileNav({ isDrawerOpen, onCloseDrawer }) {
  const { user, isAuthenticated, isAdmin, isVisitor, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    onCloseDrawer();
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/find-parking', label: 'Find', icon: Compass },
    { to: '/my-bookings', label: 'Bookings', icon: CalendarCheck },
    { to: isAuthenticated ? '/profile' : '/login', label: isAuthenticated ? 'Profile' : 'Sign In', icon: User }
  ];

  return (
    <>
      {/* Bottom Sticky Tab Bar (Mobile Only) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1 flex justify-around items-center h-16 shadow-elevated"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  isActive
                    ? 'text-brand-700 dark:text-brand-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Slide-out Mobile Drawer */}
      {isDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className="md:hidden fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseDrawer}
            aria-hidden="true"
          />

          {/* Drawer Card */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                    CampusPark
                  </h3>
                  <p className="text-xs text-slate-400">Navigation & Settings</p>
                </div>
                <button
                  type="button"
                  onClick={onCloseDrawer}
                  aria-label="Close navigation drawer"
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Identity Pill (if logged in) */}
              {(isAuthenticated || isVisitor) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl mb-4 border border-slate-200/80 dark:border-slate-700">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                    {user?.role} Role
                  </span>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/find-parking"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Compass className="w-4 h-4 text-brand-600" />
                  <span>Find Parking & Slots</span>
                </NavLink>

                {isAuthenticated && (
                  <>
                    <NavLink
                      to="/my-bookings"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <CalendarCheck className="w-4 h-4 text-brand-600" />
                      <span>My Bookings</span>
                    </NavLink>

                    <NavLink
                      to="/history"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span>Parking History</span>
                    </NavLink>

                    <NavLink
                      to="/profile"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-brand-600" />
                      <span>Profile & Vehicles</span>
                    </NavLink>
                  </>
                )}

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={onCloseDrawer}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Admin Operations</span>
                  </NavLink>
                )}

                <NavLink
                  to="/styleguide"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Palette className="w-4 h-4 text-brand-600" />
                  <span>UI/UX Styleguide</span>
                </NavLink>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <DemoDataBadge />
              </div>
            </div>

            {/* Bottom Actions: Theme & Logout */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <span>Theme</span>
                <span className="flex items-center gap-1.5">
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>

              {isAuthenticated || isVisitor ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onCloseDrawer();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-bold bg-brand-700 text-white rounded-xl shadow-soft"
                >
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

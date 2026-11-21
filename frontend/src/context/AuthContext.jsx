import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { getStoredToken } from '../services/api';
import { useToast } from './ToastContext';

/**
 * AuthContext.jsx - Authentication and Session Management for CampusPark.
 * Backed by FastAPI REST API, Apache CouchDB, and bcrypt password hashing.
 * 
 * UI/UX Principles:
 * - Nielsen Heuristic #1: Visibility of System Status (loading states, realistic feedback).
 * - Nielsen Heuristic #5: Error Prevention (validations, prevent duplicate signups).
 * - Role-Based Access Control: Directs students, faculty, visitors and admins to authorized flows.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount using active JWT token
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getStoredToken();
      const cachedUser = authService.getStoredUser();

      if (token) {
        try {
          const profile = await authService.getMe();
          if (isMounted) {
            setUser({ ...profile, rememberMe: cachedUser?.rememberMe ?? true });
          }
        } catch (err) {
          console.warn('[AuthContext] Token validation failed:', err.message);
          if (isMounted) {
            if (cachedUser) {
              setUser(cachedUser);
            } else {
              setUser(null);
            }
          }
        }
      } else if (cachedUser && cachedUser.isGuest) {
        if (isMounted) setUser(cachedUser);
      } else {
        if (isMounted) setUser(null);
      }

      if (isMounted) setIsLoading(false);
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Login with email and password via FastAPI backend
   */
  const login = async (email, password, rememberMe = true) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login({ email, password, rememberMe });
      setUser(loggedInUser);
      setIsLoading(false);
      return loggedInUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Signup new student, faculty, staff, or visitor account via backend
   */
  const signup = async (formData) => {
    setIsLoading(true);
    try {
      const { role } = formData;
      if (role === 'Admin') {
        throw new Error('Administrative roles cannot be self-registered. Please contact Campus Facilities.');
      }
      const registeredUser = await authService.register(formData);
      setUser(registeredUser);
      setIsLoading(false);
      return registeredUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Visitor guest mode: browse zones, map, availability without immediate account
   */
  const loginAsVisitor = () => {
    const visitorUser = {
      id: 'guest-visitor',
      name: 'Campus Visitor',
      email: 'visitor@guest.campus.edu',
      role: 'Visitor',
      department: 'Campus Guest',
      vehicles: [{ plate: 'VIS-TEMP', model: 'Guest Vehicle', type: 'Standard' }],
      avatarUrl: '',
      permitType: 'Temporary Day Visitor Pass',
      isGuest: true,
    };
    setUser(visitorUser);
    return visitorUser;
  };

  /**
   * Logout and clear all auth states
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: "You've been successfully signed out of CampusPark.",
    });
  };

  /**
   * Update profile details (e.g. name, department, vehicles)
   */
  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const updated = await userService.updateProfile(updates);
      const combined = { ...user, ...updated };
      setUser(combined);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile changes have been saved to CouchDB.',
      });
      return combined;
    } catch (err) {
      // Local optimistic update fallback
      const localUpdated = { ...user, ...updates };
      setUser(localUpdated);
      addToast({
        type: 'warning',
        title: 'Profile Updated Locally',
        message: err.message || 'Saved in local session.',
      });
      return localUpdated;
    }
  };

  const isAuthenticated = Boolean(user && !user.isGuest);
  const isVisitor = Boolean(user?.isGuest || user?.role === 'Visitor');
  const isAdmin = Boolean(user?.role === 'Admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isVisitor,
        isAdmin,
        login,
        signup,
        loginAsVisitor,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

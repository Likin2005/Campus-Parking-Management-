/**
 * authService.js - Authentication API client for CampusPark.
 * Interacts with FastAPI /api/auth endpoints backed by Apache CouchDB and bcrypt hashing.
 */

import api, { clearStoredToken, getStoredToken, setStoredToken } from './api';
import { storage } from '../utils/storage';

const AUTH_USER_KEY = 'campuspark_auth_session';

export const authService = {
  /**
   * Log in user with email and password
   */
  async login({ email, password, rememberMe = true }) {
    const data = await api.post('/auth/login', {
      email,
      password,
      rememberMe,
    });

    if (data.access_token) {
      setStoredToken(data.access_token, rememberMe);
      const userWithRemember = { ...data.user, rememberMe };
      if (rememberMe) {
        storage.set(AUTH_USER_KEY, userWithRemember);
        storage.removeSession(AUTH_USER_KEY);
      } else {
        storage.setSession(AUTH_USER_KEY, userWithRemember);
        storage.remove(AUTH_USER_KEY);
      }
      return userWithRemember;
    }
    throw new Error('Authentication succeeded but no access token was returned.');
  },

  /**
   * Register a new Student, Faculty, Staff, or Visitor account
   */
  async register(registrationData) {
    const rememberMe = registrationData.rememberMe !== false;
    const data = await api.post('/auth/register', {
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role || 'Student',
      department: registrationData.department || '',
      vehiclePlate: registrationData.vehiclePlate || '',
      vehicleModel: registrationData.vehicleModel || '',
    });

    if (data.access_token) {
      setStoredToken(data.access_token, rememberMe);
      const userWithRemember = { ...data.user, rememberMe };
      if (rememberMe) {
        storage.set(AUTH_USER_KEY, userWithRemember);
        storage.removeSession(AUTH_USER_KEY);
      } else {
        storage.setSession(AUTH_USER_KEY, userWithRemember);
        storage.remove(AUTH_USER_KEY);
      }
      return userWithRemember;
    }
    throw new Error('Registration completed but no access token was returned.');
  },

  /**
   * Fetch current user profile from server using active JWT
   */
  async getMe() {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const user = await api.get('/auth/me');
      return user;
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        this.logout();
      }
      throw err;
    }
  },

  /**
   * Log out user, invalidate session, clear token and local cache
   */
  async logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Swallowed on purpose to ensure client-side logout completes even if backend is offline
    } finally {
      clearStoredToken();
      storage.remove(AUTH_USER_KEY);
      storage.removeSession(AUTH_USER_KEY);
    }
  },

  /**
   * Check if an active token or session exists
   */
  getStoredUser() {
    return storage.get(AUTH_USER_KEY) || storage.getSession(AUTH_USER_KEY) || null;
  },
};

export default authService;

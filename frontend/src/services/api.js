/**
 * api.js - Centralized HTTP API client with JWT authentication and error normalization.
 * Connects React frontend directly to FastAPI backend and Apache CouchDB.
 */

import { storage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export function getStoredToken() {
  return storage.get('campuspark_jwt_token') || storage.getSession('campuspark_jwt_token') || null;
}

export function setStoredToken(token, rememberMe = true) {
  if (rememberMe) {
    storage.set('campuspark_jwt_token', token);
    storage.removeSession('campuspark_jwt_token');
  } else {
    storage.setSession('campuspark_jwt_token', token);
    storage.remove('campuspark_jwt_token');
  }
}

export function clearStoredToken() {
  storage.remove('campuspark_jwt_token');
  storage.removeSession('campuspark_jwt_token');
}

/**
 * Execute an authenticated HTTP request with JSON parsing and standardized errors.
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && (data.detail || data.message || data.error)) ||
        response.statusText ||
        'An unexpected network error occurred.';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend is unreachable or CORS blocked
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Cannot connect to CampusPark backend server. Please verify FastAPI is running on port 8000.');
      networkError.status = 503;
      throw networkError;
    }
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: (endpoint, body, options) =>
    request(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export default api;

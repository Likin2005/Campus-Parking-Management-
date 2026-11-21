/**
 * storage.js - Resilient local and session storage helper with graceful in-memory fallback.
 * UI/UX Principle: Error Prevention & Graceful Degradation (Nielsen Heuristic #9 & #5).
 * Even if user cookies/storage are restricted or quota is exceeded, the application continues functioning.
 */

const memoryFallback = {
  local: {},
  session: {},
};

export const storage = {
  // Local storage operations
  get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`[storage] LocalStorage read failed for "${key}". Using memory fallback.`, e);
      return memoryFallback.local[key] !== undefined ? memoryFallback.local[key] : defaultValue;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      memoryFallback.local[key] = value;
    } catch (e) {
      console.warn(`[storage] LocalStorage write failed for "${key}". Falling back to memory.`, e);
      memoryFallback.local[key] = value;
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
      delete memoryFallback.local[key];
    } catch (e) {
      delete memoryFallback.local[key];
    }
  },

  // Session storage operations (used when "Remember Me" is unchecked)
  getSession(key, defaultValue = null) {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      return memoryFallback.session[key] !== undefined ? memoryFallback.session[key] : defaultValue;
    }
  },

  setSession(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      memoryFallback.session[key] = value;
    } catch (e) {
      memoryFallback.session[key] = value;
    }
  },

  removeSession(key) {
    try {
      window.sessionStorage.removeItem(key);
      delete memoryFallback.session[key];
    } catch (e) {
      delete memoryFallback.session[key];
    }
  },

  // Clear all app specific keys and reset demo state
  clearAppStorage() {
    const keys = [
      'campuspark_users',
      'campuspark_zones',
      'campuspark_bookings',
      'campuspark_auth_session',
      'campuspark_theme',
      'campuspark_inbox'
    ];
    keys.forEach(k => {
      try {
        window.localStorage.removeItem(k);
        window.sessionStorage.removeItem(k);
      } catch (e) {}
      delete memoryFallback.local[k];
      delete memoryFallback.session[k];
    });
  }
};

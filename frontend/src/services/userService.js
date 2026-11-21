/**
 * userService.js - User profile and vehicles API client.
 */

import api from './api';

export const userService = {
  async getProfile() {
    return await api.get('/users/me');
  },

  async updateProfile(updates) {
    return await api.put('/users/me', updates);
  },

  async updateVehicles(vehicles) {
    return await api.put('/users/me/vehicles', { vehicles });
  },
};

export default userService;

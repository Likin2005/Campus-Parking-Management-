/**
 * zoneService.js - Parking zones and slots API client.
 * Interacts with FastAPI /api/zones endpoints backed by CouchDB documents and OCC.
 */

import api from './api';

export const zoneService = {
  /**
   * Fetch all zones with live slot status
   */
  async getZones(filters = {}) {
    const params = new URLSearchParams();
    if (filters.isCovered !== undefined && filters.isCovered !== null) {
      params.append('isCovered', filters.isCovered);
    }
    if (filters.hasEv !== undefined && filters.hasEv !== null) {
      params.append('hasEv', filters.hasEv);
    }
    if (filters.hasAccessible !== undefined && filters.hasAccessible !== null) {
      params.append('hasAccessible', filters.hasAccessible);
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/zones${queryStr}`);
  },

  /**
   * Get single zone by ID
   */
  async getZone(zoneId) {
    return await api.get(`/zones/${zoneId}`);
  },

  /**
   * Create a new parking zone (Admin only)
   */
  async createZone(zoneData) {
    return await api.post('/zones', zoneData);
  },

  /**
   * Update zone details (Admin only)
   */
  async updateZone(zoneId, updates) {
    return await api.put(`/zones/${zoneId}`, updates);
  },

  /**
   * Update single slot status (Admin only: available, occupied, disabled)
   */
  async updateSlotStatus(zoneId, slotId, status, notes = '') {
    return await api.patch(`/zones/${zoneId}/slots/${slotId}/status`, {
      status,
      notes,
    });
  },

  /**
   * Add a new slot to a zone (Admin only)
   */
  async addSlot(zoneId, slotData) {
    return await api.post(`/zones/${zoneId}/slots`, slotData);
  },
};

export default zoneService;

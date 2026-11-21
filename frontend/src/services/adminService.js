/**
 * adminService.js - Admin operations API client for CampusPark.
 */

import api from './api';

export const adminService = {
  async getInboxReports() {
    return await api.get('/admin/inbox');
  },

  async resolveInboxReport(itemId) {
    return await api.patch(`/admin/inbox/${itemId}/resolve`, {});
  },

  async resetDemoDatabase() {
    return await api.post('/admin/reset-demo', {});
  },
};

export default adminService;

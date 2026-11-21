/**
 * dashboardService.js - Aggregated campus metrics and summary API client.
 */

import api from './api';

export const dashboardService = {
  async getCampusStats() {
    return await api.get('/dashboard/stats');
  },

  async getMySummary() {
    return await api.get('/dashboard/my-summary');
  },
};

export default dashboardService;

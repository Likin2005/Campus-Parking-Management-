/**
 * bookingService.js - Parking bookings and reservations API client.
 * Interacts with FastAPI /api/bookings endpoints with CouchDB optimistic locking.
 */

import api from './api';

export const bookingService = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    return await api.post('/bookings', {
      zoneId: bookingData.zoneId,
      zoneCode: bookingData.zoneCode,
      slotId: bookingData.slotId,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      licensePlate: bookingData.licensePlate || bookingData.vehiclePlate,
      vehicleModel: bookingData.vehicleModel,
    });
  },

  /**
   * Get user's own bookings
   */
  async getMyBookings() {
    return await api.get('/bookings/my');
  },

  /**
   * Get all bookings (admin view or filtered)
   */
  async getAllBookings(status = null) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await api.get(`/bookings${query}`);
  },

  /**
   * Cancel an active booking
   */
  async cancelBooking(bookingId, reason = 'User requested cancellation') {
    return await api.patch(`/bookings/${bookingId}/cancel`, { reason });
  },

  /**
   * Restore/undo a cancelled booking
   */
  async restoreBooking(bookingId) {
    return await api.patch(`/bookings/${bookingId}/restore`, {});
  },
};

export default bookingService;

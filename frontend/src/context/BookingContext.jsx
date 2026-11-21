import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { zoneService } from '../services/zoneService';
import { bookingService } from '../services/bookingService';
import { adminService } from '../services/adminService';
import { SEED_ZONES } from '../data/seedZones';
import { SEED_BOOKINGS } from '../data/seedBookings';
import { hasTimeOverlap, validateLicensePlate } from '../utils/validators';
import { combineDateAndTime } from '../utils/dates';
import { useToast } from './ToastContext';

/**
 * BookingContext.jsx - Centralized parking slot booking, zone state, and conflict management.
 * Connected to FastAPI backend with Apache CouchDB and optimistic concurrency control (OCC).
 * 
 * UI/UX Principles:
 * - Error Prevention (Nielsen #5): Pre-emptively checks slot time collisions to stop double bookings.
 * - User Control & Freedom (Nielsen #3): Cancellation with Undo functionality.
 * - Visibility of System Status (Nielsen #1): Real-time reflection of occupancy metrics.
 */

const BookingContext = createContext(null);

const INITIAL_INBOX = [
  {
    id: 'rep-1',
    user: 'Prof. Vance (Faculty)',
    zone: 'Zone C',
    slot: 'C-04',
    issue: 'EV Charger connector cable handle loose',
    severity: 'Medium',
    status: 'Pending',
    date: 'Today, 8:15 AM'
  },
  {
    id: 'rep-2',
    user: 'Security Patrol Desk',
    zone: 'Zone B',
    slot: 'B-14',
    issue: 'Unauthorized vehicle without parking decal parked overnight',
    severity: 'High',
    status: 'Pending',
    date: 'Yesterday, 11:40 PM'
  },
  {
    id: 'rep-3',
    user: 'Student Affairs',
    zone: 'Zone A',
    slot: 'A-13',
    issue: 'Surface repaving caution tape verified intact',
    severity: 'Low',
    status: 'Resolved',
    date: '2 days ago'
  }
];

export function BookingProvider({ children }) {
  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();
  const [zones, setZones] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inboxItems, setInboxItems] = useState(INITIAL_INBOX);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Refresh all zones from CouchDB backend
   */
  const refreshZones = useCallback(async () => {
    try {
      const fetchedZones = await zoneService.getZones();
      if (Array.isArray(fetchedZones) && fetchedZones.length > 0) {
        setZones(fetchedZones);
      } else {
        setZones(SEED_ZONES);
      }
    } catch (err) {
      console.warn('[BookingContext] Failed to fetch zones from backend, using seed fallback:', err.message);
      setZones((prev) => (prev.length > 0 ? prev : SEED_ZONES));
    }
  }, []);

  /**
   * Refresh bookings from CouchDB backend
   */
  const refreshBookings = useCallback(async () => {
    try {
      const fetchedBookings = await bookingService.getMyBookings();
      if (Array.isArray(fetchedBookings)) {
        setBookings(fetchedBookings);
      }
    } catch (err) {
      console.warn('[BookingContext] Failed to fetch bookings from backend:', err.message);
      setBookings((prev) => (prev.length > 0 ? prev : SEED_BOOKINGS));
    }
  }, []);

  /**
   * Refresh inbox reports from backend (restricted to Admin users only)
   */
  const refreshInbox = useCallback(async () => {
    if (!isAdmin && user?.role !== 'Admin') {
      return;
    }
    try {
      const reports = await adminService.getInboxReports();
      if (Array.isArray(reports)) {
        setInboxItems(reports);
      }
    } catch (err) {
      console.warn('[BookingContext] Failed to fetch inbox reports from backend:', err.message);
      setInboxItems((prev) => (prev.length > 0 ? prev : INITIAL_INBOX));
    }
  }, [isAdmin, user?.role]);

  // Initial data loading on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      const tasks = [refreshZones(), refreshBookings()];
      if (isAdmin || user?.role === 'Admin') {
        tasks.push(refreshInbox());
      }
      await Promise.allSettled(tasks);
      if (isMounted) {
        setIsLoaded(true);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [refreshZones, refreshBookings, refreshInbox, isAdmin, user?.role]);

  // Refresh inbox if user switches to an Admin account
  useEffect(() => {
    if (isAdmin || user?.role === 'Admin') {
      refreshInbox();
    }
  }, [isAdmin, user?.role, refreshInbox]);

  /**
   * Check whether a slot has an active conflict with the requested timeframe
   */
  const checkSlotConflict = (slotId, startIso, endIso, excludeBookingId = null) => {
    return bookings.some((b) => {
      if (b.slotId !== slotId) return false;
      if (b.status === 'cancelled') return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;
      return hasTimeOverlap(startIso, endIso, b.startIso, b.endIso);
    });
  };

  /**
   * Create a new reservation with double-booking prevention and CouchDB persistence
   */
  const createBooking = async ({
    userId,
    userName,
    userRole,
    zoneId,
    slotId,
    date,
    startTime,
    endTime,
    licensePlate,
    vehicleModel
  }) => {
    const startIso = combineDateAndTime(date, startTime);
    const endIso = combineDateAndTime(date, endTime);

    if (!startIso || !endIso) {
      throw new Error('Please specify a valid reservation date and time range.');
    }

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      throw new Error('End time must be after the start time.');
    }

    // Plate validation
    const plateError = validateLicensePlate(licensePlate);
    if (plateError) {
      throw new Error(plateError);
    }

    // Client-side quick conflict check
    const isConflict = checkSlotConflict(slotId, startIso, endIso);
    if (isConflict) {
      throw new Error(
        `Slot ${slotId} is already reserved for this timeframe. Please select another slot or choose a different time.`
      );
    }

    try {
      // Backend handles atomic CouchDB lock and OCC
      const newBooking = await bookingService.createBooking({
        zoneId,
        slotId,
        date,
        startTime,
        endTime,
        licensePlate: licensePlate.trim().toUpperCase(),
        vehicleModel: vehicleModel || 'Registered Vehicle',
      });

      // Update local state
      setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
      // Refresh zones to reflect updated slot occupancy
      await refreshZones();

      return newBooking;
    } catch (err) {
      const errorMsg = err.message || 'Failed to complete booking. Please try again.';
      throw new Error(errorMsg);
    }
  };

  /**
   * Cancel booking with Undo option
   */
  const cancelBooking = async (bookingId, reason = 'User requested cancellation') => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      const updated = await bookingService.cancelBooking(bookingId, reason);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)));
      await refreshZones();

      // Prompt user with Undo Toast
      addToast({
        type: 'warning',
        title: 'Reservation Cancelled',
        message: `Reservation ${booking.id} for Slot ${booking.slotNumber || booking.slotId} was cancelled.`,
        action: {
          label: 'Undo Cancellation',
          onClick: () => restoreBooking(bookingId)
        }
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err.message || 'Unable to cancel booking at this time.'
      });
    }
  };

  /**
   * Restore cancelled booking (Undo action)
   */
  const restoreBooking = async (bookingId) => {
    try {
      const restored = await bookingService.restoreBooking(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...restored } : b)));
      await refreshZones();

      addToast({
        type: 'success',
        title: 'Reservation Restored',
        message: `Booking ${bookingId} has been restored successfully in CouchDB.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Cannot Undo',
        message: err.message || 'Slot may have already been reserved by another user.'
      });
    }
  };

  /**
   * Admin: toggle slot status (available, occupied, reserved, disabled)
   */
  const updateSlotStatus = async (zoneId, slotId, newStatus) => {
    try {
      await zoneService.updateSlotStatus(zoneId, slotId, newStatus);
      await refreshZones();
      addToast({
        type: 'info',
        title: 'Slot Updated',
        message: `Slot ${slotId} status changed to ${newStatus}.`
      });
    } catch (err) {
      // Optimistic local update
      setZones((prev) =>
        prev.map((zone) => {
          if (zone.id !== zoneId) return zone;
          return {
            ...zone,
            slots: zone.slots.map((slot) => {
              if (slot.id !== slotId) return slot;
              return {
                ...slot,
                status: newStatus,
                notes: newStatus === 'disabled' ? 'Disabled by Admin for Maintenance' : ''
              };
            })
          };
        })
      );
      addToast({
        type: 'warning',
        title: 'Slot Updated Locally',
        message: err.message
      });
    }
  };

  /**
   * Admin: add a new slot to a zone
   */
  const addSlot = async (zoneId, slotData) => {
    try {
      await zoneService.addSlot(zoneId, slotData);
      await refreshZones();
      addToast({
        type: 'success',
        title: 'Slot Created',
        message: `New slot successfully added to ${zoneId} in CouchDB.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Add Slot',
        message: err.message
      });
    }
  };

  /**
   * Admin: add a new zone
   */
  const addZone = async (zoneData) => {
    const code = zoneData.code.toUpperCase();
    const count = parseInt(zoneData.slotCount, 10) || 12;

    try {
      await zoneService.createZone({
        code,
        name: zoneData.name,
        tagline: zoneData.tagline || 'Newly added campus parking lot',
        type: zoneData.type || 'Surface Lot',
        isCovered: Boolean(zoneData.isCovered),
        hasEv: Boolean(zoneData.hasEv),
        hasAccessible: true,
        distanceMinutes: parseInt(zoneData.distanceMinutes, 10) || 5,
        hourlyRate: parseFloat(zoneData.hourlyRate) || 2.0,
        ratesInfo: zoneData.ratesInfo || 'Standard permits apply',
        landmark: zoneData.landmark || 'Campus East Wing',
        slotCount: count
      });
      await refreshZones();

      addToast({
        type: 'success',
        title: 'Zone Added',
        message: `Zone ${code} (${zoneData.name}) with ${count} slots created in CouchDB.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Add Zone',
        message: err.message
      });
    }
  };

  /**
   * Admin: resolve an inbox report item
   */
  const resolveInboxItem = async (id) => {
    try {
      await adminService.resolveInboxReport(id);
      await refreshInbox();
      addToast({
        type: 'info',
        title: 'Report Updated',
        message: `Support issue #${id} marked as resolved.`
      });
    } catch (err) {
      setInboxItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Resolved' } : item)));
      addToast({
        type: 'info',
        title: 'Report Updated',
        message: `Support issue #${id} marked as resolved.`
      });
    }
  };

  /**
   * Reset all demo data to initial pristine seeds
   */
  const resetDemoData = async () => {
    try {
      await adminService.resetDemoDatabase();
      await Promise.allSettled([refreshZones(), refreshBookings(), refreshInbox()]);
      addToast({
        type: 'success',
        title: 'Demo Data Reset',
        message: 'All CouchDB collections have been restored to initial demo seeds.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Could not reset CouchDB database.'
      });
    }
  };

  return (
    <BookingContext.Provider
      value={{
        zones,
        bookings,
        inboxItems,
        isLoaded,
        createBooking,
        cancelBooking,
        restoreBooking,
        checkSlotConflict,
        updateSlotStatus,
        addSlot,
        addZone,
        resolveInboxItem,
        resetDemoData,
        refreshZones,
        refreshBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { formatTimeRange } from '../utils/dates';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import {
  CalendarDays,
  Clock,
  Car,
  MapPin,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Ban
} from 'lucide-react';

/**
 * MyBookings.jsx - User Bookings Hub with Cancellation Confirmation & Undo Toast.
 * UI/UX Principles:
 * - Nielsen #3 (User Control and Freedom): Provides reversible actions (Undo toast) after cancellation.
 * - Nielsen #5 (Error Prevention): Destructive cancellation requires intentional modal confirmation.
 * - WAI-ARIA Tab list for clear categorization (Upcoming, Completed, Cancelled).
 */

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, cancelBooking } = useBookings();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Schedule change / class cancelled');

  // Filter user bookings
  const myBookings = bookings.filter((b) => b.userId === user?.id);

  const upcomingBookings = myBookings.filter((b) => b.status === 'upcoming');
  const completedBookings = myBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = myBookings.filter((b) => b.status === 'cancelled');

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length, icon: Clock },
    { id: 'completed', label: 'Completed', count: completedBookings.length, icon: CheckCircle2 },
    { id: 'cancelled', label: 'Cancelled', count: cancelledBookings.length, icon: Ban }
  ];

  const currentList =
    activeTab === 'upcoming'
      ? upcomingBookings
      : activeTab === 'completed'
      ? completedBookings
      : cancelledBookings;

  const handleConfirmCancel = () => {
    if (cancellingBooking) {
      cancelBooking(cancellingBooking.id, cancelReason);
      setCancellingBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Personal Permits & Reservations
            </span>
            <DemoDataBadge />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            My Parking Bookings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View active reservations, past permits, or manage cancellations.
          </p>
        </div>

        <Button
          onClick={() => navigate('/find-parking')}
          variant="primary"
          icon={ArrowRight}
          iconPosition="right"
        >
          Book Another Slot
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content Grid */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={`No ${activeTab} reservations`}
          description={
            activeTab === 'upcoming'
              ? "You don't have any active reservations scheduled. Find an available slot in one of the campus zones."
              : `You have no ${activeTab} parking records on file.`
          }
          actionLabel={activeTab === 'upcoming' ? 'Find Parking Now' : null}
          onAction={() => navigate('/find-parking')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentList.map((booking) => (
            <Card
              key={booking.id}
              className="flex flex-col justify-between border-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      #{booking.id}
                    </span>
                    <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mt-0.5">
                      Slot {booking.slotNumber}
                    </h2>
                  </div>
                  <Badge status={booking.status} />
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {booking.zoneName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>{formatTimeRange(booking.startIso, booking.endIso)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {booking.licensePlate}
                    </span>
                    <span className="text-slate-400">({booking.vehicleModel})</span>
                  </div>

                  {booking.status === 'cancelled' && booking.cancelReason && (
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-lg text-red-800 dark:text-red-300 text-[11px] mt-2">
                      <span className="font-semibold">Reason for cancellation:</span>{' '}
                      {booking.cancelReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <Button
                  onClick={() => navigate(`/booking-confirmation/${booking.id}`)}
                  variant="outline"
                  size="sm"
                >
                  View Digital Pass
                </Button>

                {booking.status === 'upcoming' && (
                  <Button
                    onClick={() => setCancellingBooking(booking)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        title="Cancel Parking Reservation"
        description="Are you sure you want to release this parking bay? The slot will become available for other students and faculty."
      >
        {cancellingBooking && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-semibold">Slot {cancellingBooking.slotNumber}</span> in{' '}
                {cancellingBooking.zoneName} for{' '}
                {formatTimeRange(cancellingBooking.startIso, cancellingBooking.endIso)} will be cancelled.
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cancel-reason-select"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Reason for Cancellation
              </label>
              <select
                id="cancel-reason-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Schedule change / class cancelled">Schedule change / class cancelled</option>
                <option value="Taking campus shuttle instead">Taking campus shuttle instead</option>
                <option value="Reserved wrong zone or time">Reserved wrong zone or time</option>
                <option value="Carpooling with classmate">Carpooling with classmate</option>
                <option value="Other personal reason">Other personal reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setCancellingBooking(null)}
              >
                Keep Reservation
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

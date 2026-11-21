import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { getDefaultBookingWindow, combineDateAndTime } from '../../utils/dates';
import { validateLicensePlate } from '../../utils/validators';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Calendar, Clock, Car, Shield, AlertTriangle, ArrowRight, LogIn } from 'lucide-react';

/**
 * BookingForm.jsx - Slot Details and Reservation Panel.
 * UI/UX Principles:
 * - Nielsen #5 (Error Prevention): Validates time overlaps before submission.
 * - Microcopy Rule: Verb-driven CTA buttons ("Reserve Slot A-07").
 * - Visitor Flow: Prompts visitors to log in or register while preserving their slot context.
 */

export default function BookingForm({
  slot,
  zone,
  onCancelSelection
}) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createBooking } = useBookings();
  const { addToast } = useToast();

  const defaultWindow = getDefaultBookingWindow();

  // Form states
  const [date, setDate] = useState(defaultWindow.date);
  const [startTime, setStartTime] = useState(defaultWindow.startTime);
  const [endTime, setEndTime] = useState(defaultWindow.endTime);
  const [licensePlate, setLicensePlate] = useState(user?.vehicles?.[0]?.plate || '');
  const [vehicleModel, setVehicleModel] = useState(user?.vehicles?.[0]?.model || '');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate duration and estimated fee
  const startIso = combineDateAndTime(date, startTime);
  const endIso = combineDateAndTime(date, endTime);
  const durationHours =
    startIso && endIso && new Date(endIso) > new Date(startIso)
      ? Math.max(1, (new Date(endIso) - new Date(startIso)) / (1000 * 60 * 60))
      : 2;

  const isFreePermit = user && user.role !== 'Visitor';
  const hourlyRate = slot.pricePerHour || zone.hourlyRate || 2.0;
  const estimatedCost = isFreePermit ? 0.0 : +(durationHours * hourlyRate).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Field-level validations
    const formErrors = {};
    if (!date) formErrors.date = 'Reservation date is required.';
    if (!startTime) formErrors.startTime = 'Start time is required.';
    if (!endTime) formErrors.endTime = 'End time is required.';

    if (startIso && endIso && new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      formErrors.endTime = 'End time must be after the start time.';
    }

    const plateErr = validateLicensePlate(licensePlate);
    if (plateErr) formErrors.licensePlate = plateErr;

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Visitor Mode Gate: If unauthenticated guest, prompt to sign in or redirect with return state
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in or create an account to finalize your reservation.'
      });
      navigate('/login', {
        state: {
          returnTo: '/find-parking',
          preserveSlot: slot.id,
          preserveZone: zone.id
        }
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const newBooking = await createBooking({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        zoneId: zone.id,
        slotId: slot.id,
        date,
        startTime,
        endTime,
        licensePlate,
        vehicleModel: vehicleModel || 'Registered Vehicle'
      });

      addToast({
        type: 'success',
        title: 'Reservation Confirmed!',
        message: `Slot ${slot.number} booked successfully.`
      });

      navigate(`/booking-confirmation/${newBooking.id}`);
    } catch (err) {
      setErrors({ form: err.message || 'Unable to complete reservation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-brand-500 shadow-modal">
      <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white">
              Slot {slot.number}
            </span>
            <Badge status={slot.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {zone.name} • {slot.type} Bay • Level {slot.level || 1}
          </p>
        </div>

        {onCancelSelection && (
          <button
            type="button"
            onClick={onCancelSelection}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
          >
            Change Slot
          </button>
        )}
      </div>

      {errors.form && (
        <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 rounded-xl text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selector */}
        <Input
          id="booking-date"
          label="Reservation Date"
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
          }}
          error={errors.date}
          icon={Calendar}
          required
        />

        {/* Time Window Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="booking-start-time"
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: null }));
            }}
            error={errors.startTime}
            icon={Clock}
            required
          />
          <Input
            id="booking-end-time"
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: null }));
            }}
            error={errors.endTime}
            icon={Clock}
            required
          />
        </div>

        {/* Vehicle Information */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <Input
            id="booking-license-plate"
            label="License Plate Number"
            type="text"
            placeholder="e.g. ABC-1234"
            value={licensePlate}
            onChange={(e) => {
              setLicensePlate(e.target.value);
              if (errors.licensePlate) setErrors((prev) => ({ ...prev, licensePlate: null }));
            }}
            error={errors.licensePlate}
            icon={Car}
            autoComplete="off"
            inputMode="text"
            hint="Printed on your parking pass and campus gate sensors."
            required
          />

          <Input
            id="booking-vehicle-model"
            label="Vehicle Model (Optional)"
            type="text"
            placeholder="e.g. Honda Civic (Silver)"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
          />
        </div>

        {/* Summary Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Estimated Duration</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {durationHours.toFixed(1)} hrs
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Permit Status</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              {isFreePermit ? `${user?.role} Permit (Free)` : 'Standard Visitor Rate'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Total Amount Due
            </span>
            <span className="text-base font-extrabold text-brand-700 dark:text-brand-300">
              {isFreePermit ? '$0.00' : `$${estimatedCost.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Visitor Warning if not authenticated */}
        {!isAuthenticated && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <LogIn className="w-4 h-4 flex-shrink-0 text-amber-700" />
            <span>You will be prompted to sign in to confirm this reservation.</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full shadow-elevated"
          icon={ArrowRight}
          iconPosition="right"
        >
          {isAuthenticated ? `Reserve Slot ${slot.number}` : 'Sign In to Reserve'}
        </Button>
      </form>
    </Card>
  );
}

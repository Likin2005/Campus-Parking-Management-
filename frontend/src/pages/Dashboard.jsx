import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import ProgressRing from '../components/ui/ProgressRing';
import ZoneCard from '../components/parking/ZoneCard';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { formatTimeRange } from '../utils/dates';
import {
  Compass,
  Search,
  Sparkles,
  CalendarCheck,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Car
} from 'lucide-react';

/**
 * Dashboard.jsx - Main Campus Parking Dashboard.
 * UI/UX Principles:
 * - Visual Hierarchy: Prominent circular availability metric acts as anchor for quick decision-making.
 * - Nielsen #1 (Visibility of System Status): Real-time aggregated campus capacity and immediate access to next active booking.
 * - Fitts's Law: Prominent primary CTA ("Find Parking") positioned in natural visual path.
 */

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isVisitor } = useAuth();
  const { zones, bookings, isLoaded } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Calculate aggregated campus statistics
  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const totalAvailable = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'available').length,
    0
  );
  const totalOccupied = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'occupied').length,
    0
  );
  const totalEv = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.type === 'EV Charging' && s.status === 'available').length,
    0
  );

  // Find user's next upcoming booking
  const userBookings = bookings.filter((b) => b.userId === user?.id && b.status === 'upcoming');
  const nextBooking = userBookings.length > 0 ? userBookings[0] : null;

  // Filter zones by search term
  const filteredZones = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.landmark.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Welcome & Notification Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Welcome to CampusPark
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <DemoDataBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
            {isAuthenticated ? `Hello, ${user?.name}` : 'Explore Campus Parking'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {isAuthenticated
              ? `You are signed in with a ${user?.permitType || user?.role + ' Permit'}. Real-time slot availability across all university decks is shown below.`
              : 'Browse active parking zones, check live simulated vacancy rates, and reserve your bay.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/find-parking')}
            size="lg"
            variant="primary"
            icon={Compass}
            className="shadow-elevated whitespace-nowrap"
          >
            Find Parking
          </Button>
        </div>
      </div>

      {/* Next Upcoming Booking Card (if exists) */}
      {nextBooking && (
        <div className="bg-gradient-to-r from-brand-900 to-brand-800 text-white p-5 sm:p-6 rounded-2xl shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-brand-300 border border-white/15">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">
                  Your Next Active Reservation
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Confirmed
                </span>
              </div>
              <h2 className="text-lg font-display font-bold mt-0.5">
                Slot {nextBooking.slotNumber} • {nextBooking.zoneName}
              </h2>
              <p className="text-xs text-brand-100 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-300" />
                <span>{formatTimeRange(nextBooking.startIso, nextBooking.endIso)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <Button
              onClick={() => navigate(`/booking-confirmation/${nextBooking.id}`)}
              variant="secondary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              className="bg-white hover:bg-brand-50 text-brand-900 border-none"
            >
              View Digital Pass
            </Button>
          </div>
        </div>
      )}

      {/* Campus Availability Summary Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Ring Anchor */}
        <Card className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 sm:p-8 text-center sm:text-left">
          <ProgressRing
            value={totalAvailable}
            max={totalSlots}
            size={135}
            strokeWidth={12}
            label="Available"
            sublabel={`${totalAvailable} of ${totalSlots}`}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Capacity
              </span>
              <DemoDataBadge />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              Campus Vacancy
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Overall university parking status across all 6 campus parking decks and surface lots.
            </p>
          </div>
        </Card>

        {/* Quick Highlights Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Bays
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                {totalAvailable}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Open for parking
              </p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Occupied Now
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                {totalOccupied}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Currently parked
              </p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                EV Ports Available
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                {totalEv}
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1">
                Ready for charging
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Campus Zones Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              Campus Parking Zones
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a zone to view its real-time slot layout and reserve a space.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search zones or landmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[38px]"
            />
          </div>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onSelectZone={(z) => navigate(`/find-parking?zone=${z.code}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

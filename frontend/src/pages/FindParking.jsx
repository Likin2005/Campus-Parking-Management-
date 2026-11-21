import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';
import SlotMap from '../components/parking/SlotMap';
import BookingForm from '../components/parking/BookingForm';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton, SlotGridSkeleton } from '../components/ui/Skeleton';
import {
  Compass,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Accessibility,
  Clock,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';

/**
 * FindParking.jsx - Interactive Zone Selection & Slot Map Reservation Screen.
 * UI/UX Principles:
 * - Hick's Law: Progressive disclosure separates zone selection from individual slot pinpointing.
 * - Fitts's Law: Large touch-friendly slot targets with instant reactive feedback.
 * - Dual Coding (WCAG 1.4.1): Uses color + icons + text throughout the interactive map.
 */

export default function FindParking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { zones, isLoaded } = useBookings();

  const [selectedZoneCode, setSelectedZoneCode] = useState(searchParams.get('zone') || 'A');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [coveredFilter, setCoveredFilter] = useState(false);
  const [evFilter, setEvFilter] = useState(false);
  const [adaFilter, setAdaFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle return state from auth flow
  useEffect(() => {
    if (location.state?.preserveSlot && location.state?.preserveZone && zones.length > 0) {
      const zone = zones.find((z) => z.id === location.state.preserveZone);
      if (zone) {
        setSelectedZoneCode(zone.code);
        const slot = zone.slots.find((s) => s.id === location.state.preserveSlot);
        if (slot) {
          setSelectedSlot(slot);
        }
      }
    }
  }, [location.state, zones]);

  // Sync selected zone with URL query parameter
  useEffect(() => {
    const urlZone = searchParams.get('zone');
    if (urlZone && urlZone !== selectedZoneCode) {
      setSelectedZoneCode(urlZone);
    }
  }, [searchParams]);

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <SlotGridSkeleton />
      </div>
    );
  }

  // Filter available zones according to user toggles
  const filteredZones = zones.filter((z) => {
    if (coveredFilter && !z.isCovered) return false;
    if (evFilter && !z.hasEv) return false;
    if (adaFilter && !z.hasAccessible) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        z.name.toLowerCase().includes(q) ||
        z.code.toLowerCase().includes(q) ||
        z.landmark.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentZone = zones.find((z) => z.code === selectedZoneCode) || zones[0];

  const handleZoneChange = (code) => {
    setSelectedZoneCode(code);
    setSearchParams({ zone: code });
    setSelectedSlot(null); // Reset selected slot when changing zone
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Interactive Slot Navigator
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              Find & Reserve Parking
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose a parking deck and click any green available bay to reserve your slot.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search zones, hall, or tower..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[40px]"
            />
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <button
            type="button"
            onClick={() => setCoveredFilter(!coveredFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors min-h-[36px] ${
              coveredFilter
                ? 'bg-brand-50 text-brand-800 border-brand-500 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Covered Decks Only</span>
          </button>

          <button
            type="button"
            onClick={() => setEvFilter(!evFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors min-h-[36px] ${
              evFilter
                ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Has EV Chargers</span>
          </button>

          <button
            type="button"
            onClick={() => setAdaFilter(!adaFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors min-h-[36px] ${
              adaFilter
                ? 'bg-sky-50 text-sky-800 border-sky-500 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5 text-sky-600" />
            <span>Accessible ADA</span>
          </button>

          {(coveredFilter || evFilter || adaFilter || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setCoveredFilter(false);
                setEvFilter(false);
                setAdaFilter(false);
                setSearchQuery('');
              }}
              className="text-xs text-red-600 hover:underline px-2 py-1 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Zone Switcher Tabs */}
      {filteredZones.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Zones Match Filters"
          description="Try disabling some filters or clearing your search term to see other campus lots."
          actionLabel="Reset All Filters"
          onAction={() => {
            setCoveredFilter(false);
            setEvFilter(false);
            setAdaFilter(false);
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filteredZones.map((z) => {
            const isSelected = z.code === currentZone?.code;
            const freeSlots = z.slots.filter((s) => s.status === 'available').length;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => handleZoneChange(z.code)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-left transition-all min-h-[48px] focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  isSelected
                    ? 'bg-brand-700 text-white border-brand-800 shadow-md font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {z.code}
                </span>
                <div>
                  <div className="text-xs font-bold truncate max-w-[140px] sm:max-w-[200px]">
                    Zone {z.code}
                  </div>
                  <div className={`text-[10px] ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                    {freeSlots} slots free
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Grid & Reservation Panel */}
      {currentZone && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Interactive Map (2 Columns on Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Selected Zone Header Banner */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                    {currentZone.name}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {currentZone.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>{currentZone.landmark}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentZone.distanceMinutes} min walk to lecture halls</span>
                </p>
              </div>

              <div className="text-xs text-right sm:text-right font-medium text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                  {currentZone.slots.filter((s) => s.status === 'available').length}
                </span>{' '}
                bays open
              </div>
            </div>

            {/* Interactive Slot Grid Layout */}
            <SlotMap
              zone={currentZone}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
            />
          </div>

          {/* Booking Panel / Sidebar (1 Column on Desktop) */}
          <div className="lg:col-span-1 sticky top-20">
            {selectedSlot ? (
              <BookingForm
                slot={selectedSlot}
                zone={currentZone}
                onCancelSelection={() => setSelectedSlot(null)}
              />
            ) : (
              <Card className="text-center p-8 space-y-4 border-dashed border-2 border-slate-300 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  No Slot Selected
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Click on any <span className="text-emerald-600 font-semibold">green available bay</span> on the map to begin your reservation.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">
                    Quick Booking Guide:
                  </div>
                  <div>• Select date & time range</div>
                  <div>• System ensures zero double-booking</div>
                  <div>• Generates digital pass & calendar sync</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

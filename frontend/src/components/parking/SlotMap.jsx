import React, { useState } from 'react';
import SlotButton from './SlotButton';
import Legend from './Legend';
import { Layers, Filter, Compass } from 'lucide-react';

/**
 * SlotMap.jsx - Grid and Deck Layout for Parking Slots.
 * UI/UX Principles:
 * - Match between System and Real World (Nielsen #2): Spatial drive aisles and slot lanes mimic physical garages.
 * - Hick's Law: Progressive filtering by vehicle type (EV, Accessible, etc.) narrows selection anxiety.
 */

export default function SlotMap({
  zone,
  selectedSlot,
  onSelectSlot
}) {
  const [filterType, setFilterType] = useState('All');
  const [activeLevel, setActiveLevel] = useState(1);

  if (!zone || !zone.slots) return null;

  // Has multiple levels check
  const levels = Array.from(new Set(zone.slots.map((s) => s.level || 1))).sort();

  // Filter slots by level and vehicle type
  const visibleSlots = zone.slots.filter((slot) => {
    const matchesLevel = levels.length > 1 ? (slot.level || 1) === activeLevel : true;
    const matchesType = filterType === 'All' ? true : slot.type === filterType;
    return matchesLevel && matchesType;
  });

  // Group slots into two rows/aisles to simulate realistic campus drive lanes
  const midpoint = Math.ceil(visibleSlots.length / 2);
  const rowA = visibleSlots.slice(0, midpoint);
  const rowB = visibleSlots.slice(midpoint);

  const slotTypes = ['All', 'Standard', 'EV Charging', 'Accessible', 'Compact', 'Motorcycle'];

  return (
    <div className="space-y-5">
      {/* Controls Bar: Filters & Levels */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
        {/* Vehicle Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
          {slotTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
                filterType === type
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Level Switcher (if multi-level) */}
        {levels.length > 1 && (
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveLevel(lvl)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeLevel === lvl
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spatial Parking Deck Grid */}
      <div className="p-4 sm:p-6 bg-slate-100/90 dark:bg-slate-950/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-inner">
        {/* Gate Entry Banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-2">
          <div className="flex items-center gap-1.5 font-semibold">
            <Compass className="w-4 h-4 text-brand-600" />
            <span>North Gate Entry & Security Sensor</span>
          </div>
          <span className="text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
            Speed Limit 10 MPH
          </span>
        </div>

        {/* Drive Bay Row 1 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 sm:gap-3 mb-4">
          {rowA.map((slot) => (
            <SlotButton
              key={slot.id}
              slot={slot}
              isSelected={selectedSlot?.id === slot.id}
              onSelect={onSelectSlot}
            />
          ))}
        </div>

        {/* Drive Aisle Lane Marking */}
        <div className="my-5 py-3 border-y border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-mono font-bold tracking-widest uppercase select-none">
          ◀ DRIVE AISLE — ONE WAY TRAFFIC ▶
        </div>

        {/* Drive Bay Row 2 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 sm:gap-3 mt-4">
          {rowB.map((slot) => (
            <SlotButton
              key={slot.id}
              slot={slot}
              isSelected={selectedSlot?.id === slot.id}
              onSelect={onSelectSlot}
            />
          ))}
        </div>
      </div>

      {/* Accessible Legend */}
      <Legend />
    </div>
  );
}

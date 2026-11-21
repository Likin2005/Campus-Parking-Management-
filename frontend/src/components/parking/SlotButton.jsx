import React from 'react';
import { CheckCircle2, Ban, Clock, Wrench, Sparkles, Zap, Accessibility, Bike, Car } from 'lucide-react';

/**
 * SlotButton.jsx - Interactive, Accessible Parking Slot Unit.
 * UI/UX Principles:
 * - Fitts's Law: Adequate touch target size for touch and mouse ergonomics.
 * - WCAG 2.1.1 (Keyboard Navigable): Tab-focusable, Enter/Space activation.
 * - WCAG 1.4.1 (Use of Color): Glyph icon + text code + status indicator pattern.
 */

export default function SlotButton({
  slot,
  isSelected = false,
  onSelect,
  disabled = false
}) {
  const isAvailable = slot.status === 'available';
  const isOccupied = slot.status === 'occupied';
  const isReserved = slot.status === 'reserved';
  const isUnderMaintenance = slot.status === 'disabled';

  // Determine Type Icon
  const TypeIcon = {
    'EV Charging': Zap,
    'Accessible': Accessibility,
    'Motorcycle': Bike,
    'Compact': Car,
    'Standard': Car
  }[slot.type] || Car;

  // Status visual appearance
  let stateClasses = 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500 hover:shadow-md cursor-pointer dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800';
  let StatusIcon = CheckCircle2;
  let statusText = 'Available';

  if (isSelected) {
    stateClasses = 'bg-brand-50 text-brand-900 border-brand-600 ring-2 ring-brand-600 shadow-md transform scale-[1.02] dark:bg-brand-950 dark:text-brand-100';
    StatusIcon = Sparkles;
    statusText = 'Selected';
  } else if (isOccupied) {
    stateClasses = 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-75 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700';
    StatusIcon = Ban;
    statusText = 'Occupied';
  } else if (isReserved) {
    stateClasses = 'bg-amber-50 text-amber-900 border-amber-300 cursor-not-allowed opacity-80 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800';
    StatusIcon = Clock;
    statusText = 'Reserved';
  } else if (isUnderMaintenance) {
    stateClasses = 'bg-red-50 text-red-900 border-red-300 cursor-not-allowed opacity-75 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800';
    StatusIcon = Wrench;
    statusText = 'Maintenance';
  }

  const isClickable = isAvailable && !disabled;

  const handleClick = () => {
    if (isClickable && onSelect) {
      onSelect(slot);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
      e.preventDefault();
      onSelect(slot);
    }
  };

  return (
    <button
      type="button"
      role="button"
      aria-label={`Slot ${slot.number}, ${slot.type}, status: ${statusText}`}
      aria-pressed={isSelected}
      disabled={!isClickable && !isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all duration-150 min-h-[64px] min-w-[58px] sm:min-w-[64px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 select-none ${stateClasses}`}
    >
      {/* Top Header: Slot Code + Type Icon */}
      <div className="w-full flex items-center justify-between text-[11px] font-bold font-mono">
        <span>{slot.number}</span>
        <TypeIcon className="w-3.5 h-3.5 opacity-80" />
      </div>

      {/* Center Indicator */}
      <div className="my-1">
        <StatusIcon className="w-4 h-4 text-current" strokeWidth={2.2} />
      </div>

      {/* Bottom Label */}
      <div className="w-full text-center text-[10px] uppercase tracking-wider font-semibold truncate">
        {isSelected ? 'Selected' : slot.type === 'EV Charging' ? 'EV' : slot.type === 'Accessible' ? 'ADA' : statusText}
      </div>
    </button>
  );
}

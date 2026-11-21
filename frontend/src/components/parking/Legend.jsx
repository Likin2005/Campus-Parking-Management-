import React from 'react';
import { CheckCircle2, Ban, Clock, Wrench, Sparkles, Zap, Accessibility, Car, Bike } from 'lucide-react';

/**
 * Legend.jsx - Explicit Visual & Accessible Legend for Parking Slots.
 * UI/UX Principle: WCAG 2.2 Guideline 1.4.1 (Non-Color Identifiers).
 * Explains all states and specialized bays with color, glyph icons, and written text.
 */

export default function Legend({ className = '' }) {
  const statusItems = [
    { label: 'Available', color: 'bg-emerald-50 text-emerald-800 border-emerald-400', icon: CheckCircle2 },
    { label: 'Occupied', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: Ban },
    { label: 'Reserved', color: 'bg-amber-50 text-amber-800 border-amber-400', icon: Clock },
    { label: 'Maintenance', color: 'bg-red-50 text-red-800 border-red-400', icon: Wrench },
    { label: 'Selected', color: 'bg-brand-50 text-brand-800 border-brand-600 ring-2 ring-brand-600', icon: Sparkles }
  ];

  const typeItems = [
    { label: 'Standard Bay', icon: Car },
    { label: 'EV Charging', icon: Zap },
    { label: 'Accessible (ADA)', icon: Accessibility },
    { label: 'Motorcycle', icon: Bike }
  ];

  return (
    <div
      aria-label="Parking map legend"
      className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-soft ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Statuses */}
        <div>
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Slot Statuses
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {statusItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${item.color}`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Specialized Types */}
        <div>
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Slot Types
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {typeItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

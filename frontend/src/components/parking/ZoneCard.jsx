import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import DemoDataBadge from '../ui/DemoDataBadge';
import { getZoneStats } from '../../data/seedZones';
import { ShieldCheck, Zap, Accessibility, Clock, MapPin, ArrowRight } from 'lucide-react';

/**
 * ZoneCard.jsx - Summary card for campus parking zones.
 * UI/UX Principles:
 * - Visual Hierarchy: Available count is large and clearly prominent.
 * - Gestalt Law of Proximity: Grouping zone details, walking time, and action.
 */

export default function ZoneCard({ zone, onSelectZone, isSelected = false }) {
  const stats = getZoneStats(zone);

  return (
    <Card
      hover
      className={`relative flex flex-col justify-between transition-all duration-200 border-2 ${
        isSelected
          ? 'border-brand-600 ring-2 ring-brand-100 dark:ring-brand-950/60 shadow-elevated'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      <div>
        {/* Header: Code Pill, Name, and Demo Data Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-brand-700 text-white font-display font-bold text-lg flex items-center justify-center shadow-xs">
              {zone.code}
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-snug">
                {zone.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{zone.landmark}</span>
              </div>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {zone.tagline}
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {zone.isCovered && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <ShieldCheck className="w-3 h-3 text-brand-600" />
              Covered
            </span>
          )}
          {zone.hasEv && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Zap className="w-3 h-3 text-emerald-600" />
              EV Chargers
            </span>
          )}
          {zone.hasAccessible && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
              <Accessibility className="w-3 h-3 text-sky-600" />
              ADA Accessible
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            {zone.distanceMinutes} min walk
          </span>
        </div>

        {/* Availability Meter */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Availability
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              <span className="text-emerald-600 dark:text-emerald-400 text-base font-extrabold">{stats.available}</span> / {stats.total} slots
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                stats.percentAvailable > 35
                  ? 'bg-emerald-500'
                  : stats.percentAvailable > 15
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${stats.percentAvailable}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>{zone.ratesInfo}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.percentAvailable}% Free</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <Button
        onClick={() => onSelectZone(zone)}
        variant={isSelected ? 'secondary' : 'primary'}
        className="w-full"
        icon={ArrowRight}
        iconPosition="right"
      >
        {isSelected ? 'Viewing Slots' : `View Slots in Zone ${zone.code}`}
      </Button>
    </Card>
  );
}

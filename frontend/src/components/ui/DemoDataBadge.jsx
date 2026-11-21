import React, { useState } from 'react';
import { Database, Info } from 'lucide-react';

/**
 * DemoDataBadge.jsx - Honesty Rule & Transparency Component.
 * UI/UX Principle: Aesthetic & Minimalist Design + Honesty in System Status (Nielsen #1 & #8).
 * Ensures users know occupancy figures are simulated demo heuristics rather than live physical sensors.
 */
export default function DemoDataBadge({ className = '', size = 'sm' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Demo simulated data disclaimer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
      >
        <Database className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        <span>Demo Data</span>
        <Info className="w-3 h-3 opacity-70" />
      </button>

      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 text-center leading-relaxed pointer-events-none"
        >
          <div className="font-semibold text-amber-300 mb-0.5">Simulated College Project</div>
          All slot states, occupancy numbers, and permits are simulated for academic UI/UX demonstration. No live hardware sensors are connected.
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

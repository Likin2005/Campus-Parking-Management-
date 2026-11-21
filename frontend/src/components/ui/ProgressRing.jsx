import React from 'react';

/**
 * ProgressRing.jsx - Circular SVG availability meter with accessible semantic markup.
 * UI/UX Principles:
 * - Visual Hierarchy: Availability summary acts as the dominant focal anchor on the dashboard.
 * - WCAG 4.1.2: role="progressbar" with aria-valuenow and aria-valuemax attributes.
 */

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 140,
  strokeWidth = 12,
  label = 'Available',
  sublabel = null,
  className = ''
}) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Semantic color based on availability threshold
  let strokeColor = '#10B981'; // Green (>40%)
  if (percentage < 15) {
    strokeColor = '#EF4444'; // Red (<15%)
  } else if (percentage < 35) {
    strokeColor = '#F59E0B'; // Amber (15-35%)
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${value} of ${max} parking slots available (${percentage}%)`}
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
        />
        {/* Fill indicator circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          fill="transparent"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white leading-none">
          {percentage}%
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
          {label}
        </span>
        {sublabel && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

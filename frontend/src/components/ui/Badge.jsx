import React from 'react';
import { CheckCircle2, Clock, Ban, Wrench, Sparkles, Check, AlertCircle, Info } from 'lucide-react';

/**
 * Badge.jsx - Accessible Status Pill with Dual-Coding (Color + Icon + Text).
 * UI/UX Principle: WCAG 2.2 Guideline 1.4.1 (Use of Color).
 * Color is NEVER used as the sole visual means of conveying information, indicating an action,
 * prompting a response, or distinguishing a visual element.
 */

export default function Badge({
  status, // 'available' | 'occupied' | 'reserved' | 'disabled' | 'selected' | 'upcoming' | 'completed' | 'cancelled'
  label = null,
  icon: CustomIcon = null,
  size = 'md',
  className = ''
}) {
  const configs = {
    available: {
      label: 'Available',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800'
    },
    occupied: {
      label: 'Occupied',
      icon: Ban,
      style: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    },
    reserved: {
      label: 'Reserved',
      icon: Clock,
      style: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800'
    },
    disabled: {
      label: 'Maintenance',
      icon: Wrench,
      style: 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800'
    },
    selected: {
      label: 'Selected',
      icon: Sparkles,
      style: 'bg-brand-50 text-brand-800 border-brand-500 ring-1 ring-brand-500 dark:bg-brand-950/60 dark:text-brand-200'
    },
    upcoming: {
      label: 'Upcoming',
      icon: Clock,
      style: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800'
    },
    completed: {
      label: 'Completed',
      icon: Check,
      style: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    },
    cancelled: {
      label: 'Cancelled',
      icon: AlertCircle,
      style: 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800'
    },
    info: {
      label: 'Info',
      icon: Info,
      style: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800'
    }
  };

  const key = (status || 'info').toLowerCase();
  const config = configs[key] || configs.info;
  const IconComponent = CustomIcon || config.icon;
  const displayText = label || config.label;

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.style} ${sizeStyles} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.2} />
      <span>{displayText}</span>
    </span>
  );
}

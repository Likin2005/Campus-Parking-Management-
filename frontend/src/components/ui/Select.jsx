import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Select.jsx - Accessible Dropdown Select Component.
 * UI/UX Principle: Error Prevention & Consistency (Nielsen #4 & #5).
 */

export default function Select({
  id,
  label,
  value,
  onChange,
  options = [],
  error = null,
  hint = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const selectId = id || `select-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 6)}`;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={`${error ? errorId : ''} ${hint ? hintId : ''}`.trim() || undefined}
          className={`w-full appearance-none rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 pl-3.5 pr-10 transition-colors min-h-[44px]
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-950/50'
            }
            disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none`}
          {...props}
        >
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5" />
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}

      {error && (
        <div id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

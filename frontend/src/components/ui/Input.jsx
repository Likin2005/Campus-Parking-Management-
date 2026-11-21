import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Input.jsx - Accessible Form Input Component.
 * UI/UX Principles:
 * - Nielsen #9 (Help Users Recognize, Diagnose, and Recover from Errors): Direct, field-specific error messages.
 * - WCAG 3.3.2 (Labels or Instructions): Persistent label explicitly tied to input via htmlFor/id.
 * - Single-column form convention with labels above inputs to reduce saccadic eye movements.
 */

export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error = null,
  hint = null,
  placeholder = '',
  required = false,
  autoComplete,
  inputMode,
  disabled = false,
  className = '',
  icon: Icon = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const computedType = isPasswordField ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || `input-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 6)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={computedType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={`${error ? errorId : ''} ${hint ? hintId : ''}`.trim() || undefined}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 transition-colors min-h-[44px]
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${isPasswordField ? 'pr-11' : 'pr-3.5'}
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-950/50'
            }
            disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-800 focus:outline-none`}
          {...props}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
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

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button.jsx - Reusable accessible button component.
 * UI/UX Principles:
 * - Fitts's Law: Generous touch targets (min 44px) for rapid, effortless mobile and desktop interaction.
 * - Nielsen #1 (Visibility of System Status): Explicit loading spinner and disabled state feedback.
 * - WCAG 2.4.7 (Focus Visible): High-contrast focus outline for keyboard navigators.
 */

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 min-h-[44px]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold'
  }[size] || 'text-sm px-4 py-2.5 gap-2';

  const variantStyles = {
    primary:
      'bg-brand-700 hover:bg-brand-800 text-white shadow-soft focus-visible:ring-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 focus-visible:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-300 dark:text-slate-200 dark:hover:bg-slate-800/80',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-soft focus-visible:ring-red-500',
    outline:
      'bg-transparent border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 focus-visible:ring-brand-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
  }[variant] || 'bg-brand-700 text-white';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}

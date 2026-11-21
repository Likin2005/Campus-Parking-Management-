import React from 'react';
import Button from './Button';

/**
 * EmptyState.jsx - Informative zero-data fallback screen.
 * UI/UX Principle: Helpful System Guidance & Next Best Action.
 * Rather than a blank screen or cryptic "No records", guides user to their next step.
 */

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel = null,
  onAction = null,
  secondaryActionLabel = null,
  onSecondaryAction = null,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" strokeWidth={1.8} />
        </div>
      )}

      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="secondary">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

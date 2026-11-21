import React from 'react';

/**
 * Card.jsx - Reusable Card Surface Component.
 * UI/UX Principle: Gestalt Law of Common Region & Proximity.
 * Related data and controls are bounded in distinct, elevated visual surfaces.
 */

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft transition-all duration-200 ${
        hover ? 'hover:shadow-elevated hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

import React from 'react';

/**
 * Tabs.jsx - Accessible Tab Bar Component.
 * UI/UX Principles:
 * - Nielsen #4: Consistency and Standards (standard tab navigation patterns).
 * - WAI-ARIA Tab Design Pattern: role="tablist", role="tab", aria-selected, aria-controls.
 */

export default function Tabs({
  tabs, // [{ id: 'upcoming', label: 'Upcoming', count?: 2, icon?: Icon }]
  activeTab,
  onChange,
  className = ''
}) {
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % tabs.length;
      onChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onChange(tabs[prevIndex].id);
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-full overflow-x-auto ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold ${
                  isActive
                    ? 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

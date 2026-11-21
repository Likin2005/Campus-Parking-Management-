import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { formatDateTime, formatDate, formatTimeRange } from '../utils/dates';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import {
  History as HistoryIcon,
  Search,
  ArrowUpDown,
  Car,
  Clock,
  MapPin,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

/**
 * History.jsx - Searchable & Sortable Historical Log of Parking Reservations.
 * UI/UX Principles:
 * - Nielsen #7 (Flexibility and Efficiency of Use): Multi-column sorting and instant client-side filtering.
 * - Recognition Over Recall: Detailed historical records save users from having to remember prior permit usage.
 */

export default function History() {
  const { user } = useAuth();
  const { bookings } = useBookings();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter for user
  const userHistory = bookings.filter((b) => b.userId === user?.id);

  // Apply search and filter
  const filtered = userHistory.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.slotNumber.toLowerCase().includes(q) ||
        item.zoneName.toLowerCase().includes(q) ||
        item.licensePlate.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.startIso) - new Date(a.startIso);
    }
    if (sortBy === 'date-asc') {
      return new Date(a.startIso) - new Date(b.startIso);
    }
    if (sortBy === 'slot') {
      return a.slotNumber.localeCompare(b.slotNumber);
    }
    if (sortBy === 'zone') {
      return a.zoneName.localeCompare(b.zoneName);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Audit & Permit Archive
            </span>
            <DemoDataBadge />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Parking History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Searchable and sortable records of all your historical campus reservations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search slot, zone, or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[38px]"
          />
        </div>

        {/* Status and Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[38px]"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming Only</option>
            <option value="completed">Completed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[38px]"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="slot">Slot Number</option>
            <option value="zone">Zone Name</option>
          </select>
        </div>
      </div>

      {/* History Table / Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No Matching Records"
          description="No parking records found matching your current filter criteria."
          actionLabel="Clear Filter"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Reservation ID</th>
                  <th className="py-3.5 px-4">Slot & Zone</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Permit Applied</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        Slot {item.slotNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.zoneName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {formatDate(item.startIso)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatTimeRange(item.startIso, item.endIso)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                        {item.licensePlate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {item.permitUsed}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

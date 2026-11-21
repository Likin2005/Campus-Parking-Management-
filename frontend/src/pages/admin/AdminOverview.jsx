import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBookings } from '../../context/BookingContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DemoDataBadge from '../../components/ui/DemoDataBadge';
import {
  Shield,
  Layers,
  Grid,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Car,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

/**
 * AdminOverview.jsx - Campus Parking Facility Management Dashboard.
 * UI/UX Principles:
 * - Nielsen #1 (Visibility of System Status): Real-time occupancy analytics with visual SVG trend charts.
 * - Hick's Law: Segmented views for high-level metrics, zone controls, and support issue queue.
 */

export default function AdminOverview() {
  const navigate = useNavigate();
  const { zones, bookings, inboxItems, resolveInboxItem, resetDemoData } = useBookings();

  // Metrics calculation
  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const totalOccupied = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'occupied').length,
    0
  );
  const totalReserved = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'reserved').length,
    0
  );
  const totalDisabled = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'disabled').length,
    0
  );
  const totalAvailable = totalSlots - (totalOccupied + totalReserved + totalDisabled);
  const occupancyRate = totalSlots > 0 ? Math.round(((totalOccupied + totalReserved) / totalSlots) * 100) : 0;

  // Hand-built SVG Trend Data for Campus Hourly Occupancy (8 AM to 8 PM)
  const hourlyData = [
    { hour: '8 AM', pct: 25 },
    { hour: '9 AM', pct: 55 },
    { hour: '10 AM', pct: 82 },
    { hour: '11 AM', pct: 94 },
    { hour: '12 PM', pct: 90 },
    { hour: '1 PM', pct: 88 },
    { hour: '2 PM', pct: 92 },
    { hour: '3 PM', pct: 75 },
    { hour: '4 PM', pct: 60 },
    { hour: '5 PM', pct: 40 },
    { hour: '6 PM', pct: 28 },
    { hour: '7 PM', pct: 18 }
  ];

  return (
    <div className="space-y-8">
      {/* Admin Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-purple-200">
              Campus Facilities & Security Portal
            </span>
            <DemoDataBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            Parking Operations Management
          </h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Monitor real-time simulated occupancy, adjust zone capacity, toggle slot states, and resolve facility reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate('/admin/zones')}
            variant="secondary"
            icon={Layers}
            className="bg-white text-purple-950 hover:bg-purple-50"
          >
            Manage Zones
          </Button>
          <Button
            onClick={() => navigate('/admin/slots')}
            variant="secondary"
            icon={Grid}
            className="bg-white text-purple-950 hover:bg-purple-50"
          >
            Manage Slots
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Capacity
          </span>
          <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mt-2">
            {totalSlots}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across 6 active zones</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Occupancy Rate
          </span>
          <div className="text-3xl font-display font-extrabold text-brand-600 dark:text-brand-400 mt-2">
            {occupancyRate}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {totalOccupied + totalReserved} bays engaged
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Reservations
          </span>
          <div className="text-3xl font-display font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {totalReserved}
          </div>
          <p className="text-xs text-slate-400 mt-1">Pre-booked by students/faculty</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Under Maintenance
          </span>
          <div className="text-3xl font-display font-extrabold text-red-600 dark:text-red-400 mt-2">
            {totalDisabled}
          </div>
          <p className="text-xs text-slate-400 mt-1">Disabled for repairs</p>
        </Card>
      </div>

      {/* Charts Section: Handcrafted Clean SVG Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Trend Line / Area Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Campus Peak Occupancy Trend
              </h2>
              <p className="text-xs text-slate-400">
                Simulated hourly load throughout campus operating hours
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>

          {/* SVG Area Chart */}
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12306B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#12306B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#E2E8F0" strokeDasharray="3 3" />

              {/* Fill Area */}
              <path
                d={`M 0 160 ${hourlyData
                  .map((d, i) => `L ${(i / (hourlyData.length - 1)) * 500} ${160 - (d.pct / 100) * 140}`)
                  .join(' ')} L 500 160 Z`}
                fill="url(#occupancyGradient)"
              />

              {/* Trend Stroke Line */}
              <path
                d={`M 0 ${160 - (hourlyData[0].pct / 100) * 140} ${hourlyData
                  .map((d, i) => `L ${(i / (hourlyData.length - 1)) * 500} ${160 - (d.pct / 100) * 140}`)
                  .join(' ')}`}
                fill="none"
                stroke="#12306B"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              {hourlyData.map((d, i) => {
                const x = (i / (hourlyData.length - 1)) * 500;
                const y = 160 - (d.pct / 100) * 140;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#12306B" strokeWidth="2.5" />
                    {i % 2 === 0 && (
                      <text x={x} y="178" fontSize="10" textAnchor="middle" fill="#94A3B8">
                        {d.hour}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Peak Demand: 11:00 AM – 2:00 PM</span>
            <span className="font-semibold text-brand-700 dark:text-brand-300">Peak Load 94%</span>
          </div>
        </Card>

        {/* Zone Occupancy Distribution Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Live Zone Distribution
              </h2>
              <p className="text-xs text-slate-400">Available vs. Engaged bays per zone</p>
            </div>
            <Layers className="w-5 h-5 text-purple-600" />
          </div>

          <div className="space-y-3.5 pt-2">
            {zones.map((zone) => {
              const free = zone.slots.filter((s) => s.status === 'available').length;
              const total = zone.slots.length;
              const used = total - free;
              const pctUsed = total > 0 ? Math.round((used / total) * 100) : 0;

              return (
                <div key={zone.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">
                      Zone {zone.code}: {zone.name.split('—')[1]?.trim() || zone.name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {used}/{total} ({pctUsed}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${pctUsed > 80 ? 'bg-red-500' : pctUsed > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pctUsed}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Two Column Section: Recent Bookings & Facility Reports Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Reservations Activity */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">
              Recent Campus Bookings
            </h2>
            <Link
              to="/history"
              className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline"
            >
              View Full History
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Slot {b.slotNumber} • {b.userName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {b.zoneName} • {b.licensePlate}
                  </div>
                </div>
                <Badge status={b.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Facility Support & Security Reports Inbox */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Facilities & Security Inbox
              </h2>
              <p className="text-xs text-slate-400">Student & patrol incident reports</p>
            </div>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {inboxItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.zone} ({item.slot})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity === 'High'
                          ? 'bg-red-100 text-red-800'
                          : item.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{item.issue}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Reported by: {item.user}</p>
                </div>

                {item.status === 'Pending' ? (
                  <Button
                    onClick={() => resolveInboxItem(item.id)}
                    variant="outline"
                    size="sm"
                    icon={CheckCircle2}
                  >
                    Resolve
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

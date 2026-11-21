import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';
import { downloadIcsFile } from '../utils/ics';
import { formatTimeRange, formatDateTime } from '../utils/dates';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import EmptyState from '../components/ui/EmptyState';
import {
  CheckCircle2,
  Calendar,
  Download,
  Share2,
  MapPin,
  Car,
  ShieldCheck,
  ArrowRight,
  Printer
} from 'lucide-react';

/**
 * BookingConfirmation.jsx - Digital Parking Permit & Calendar Download Screen.
 * UI/UX Principles:
 * - Visibility of System Status (Nielsen #1): Immediate positive closure after form submission.
 * - Match between System and Real World (Nielsen #2): Familiar boarding-pass / digital ticket aesthetic.
 * - Integration with External Systems: One-click .ics calendar export.
 */

// Offline deterministic SVG QR Code generator
function LocalQrCode({ value, size = 160 }) {
  // Deterministic pattern based on string hash
  const hash = Array.from(value || 'CAMPUSPARK').reduce(
    (acc, char) => (acc << 5) - acc + char.charCodeAt(0),
    0
  );

  const gridSize = 17;
  const cells = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Corner positioning markers
      const isCornerTL = r < 5 && c < 5;
      const isCornerTR = r < 5 && c >= gridSize - 5;
      const isCornerBL = r >= gridSize - 5 && c < 5;

      if (isCornerTL || isCornerTR || isCornerBL) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4 ||
                         r === gridSize - 1 || r === gridSize - 5 ||
                         c === gridSize - 1 || c === gridSize - 5;
        const isCenter = (r >= 1 && r <= 3 && c >= 1 && c <= 3) ||
                         (r >= 1 && r <= 3 && c >= gridSize - 4 && c <= gridSize - 2) ||
                         (r >= gridSize - 4 && r <= gridSize - 2 && c >= 1 && c <= 3);
        cells.push(isBorder || isCenter);
      } else {
        // Pseudo-random deterministic fill
        const bit = ((hash * (r + 1) * (c + 1)) ^ (r * 13 + c * 7)) % 3 === 0;
        cells.push(bit);
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl shadow-xs">
      <rect width={size} height={size} fill="#FFFFFF" rx="8" />
      {cells.map((isFilled, idx) => {
        if (!isFilled) return null;
        const r = Math.floor(idx / gridSize);
        const c = idx % gridSize;
        return (
          <rect
            key={idx}
            x={c * cellSize + 1}
            y={r * cellSize + 1}
            width={cellSize - 1.5}
            height={cellSize - 1.5}
            fill="#12306B"
            rx="1.5"
          />
        );
      })}
    </svg>
  );
}

export default function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, isLoaded } = useBookings();

  const booking = bookings.find((b) => b.id === id);

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-slate-500">
        <p className="text-sm animate-pulse">Loading reservation pass...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Reservation Not Found"
        description="We couldn't locate this reservation record. It may have expired or was created in another session."
        actionLabel="Go to My Bookings"
        onAction={() => navigate('/my-bookings')}
      />
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Success Banner */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-soft">
          <CheckCircle2 className="w-9 h-9" strokeWidth={2.2} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Reservation Confirmed
          </span>
          <DemoDataBadge />
        </div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
          You're All Set to Park!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Your parking bay has been reserved. Present the digital pass below to campus gates or sensors.
        </p>
      </div>

      {/* Digital Parking Pass Card */}
      <Card className="p-0 overflow-hidden border-2 border-brand-500 shadow-modal">
        {/* Pass Top Ribbon */}
        <div className="bg-brand-700 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-brand-200">
              Pass ID: {booking.id}
            </span>
            <h2 className="text-2xl font-display font-black mt-1">
              Slot {booking.slotNumber}
            </h2>
            <p className="text-xs text-brand-100 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-300" />
              <span>{booking.zoneName}</span>
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] uppercase font-semibold text-brand-200">
              Permit Category
            </div>
            <div className="text-sm font-bold text-white">
              {booking.permitUsed}
            </div>
          </div>
        </div>

        {/* Pass Middle Body with QR Code and Details */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <LocalQrCode value={booking.id} size={150} />
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
              {booking.id}
            </span>
            <span className="text-[10px] text-slate-400">
              Scan at Entrance Gate
            </span>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-3.5 text-xs">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Time Window</span>
              <span className="font-bold text-slate-900 dark:text-white text-right">
                {formatTimeRange(booking.startIso, booking.endIso)}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Vehicle Plate</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {booking.licensePlate}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Reserved For</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {booking.userName} ({booking.userRole})
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Vehicle Model</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {booking.vehicleModel}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Amount Charged</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ${booking.rateCharged.toFixed(2)} (Permit Applied)
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <Button
            onClick={() => downloadIcsFile(booking)}
            variant="outline"
            size="sm"
            icon={Download}
          >
            Add to Calendar (.ics)
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="ghost"
              size="sm"
              icon={Printer}
            >
              Print Ticket
            </Button>
            <Button
              onClick={() => navigate('/my-bookings')}
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
            >
              Go to My Bookings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

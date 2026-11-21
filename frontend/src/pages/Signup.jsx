import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import { Car, CheckCircle2 } from 'lucide-react';

/**
 * Signup.jsx - Registration Page with Split-Screen Brand Layout.
 * UI/UX Principles:
 * - Hick's Law: Structured inputs with progressive field validation to prevent cognitive overload.
 */

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F8FB] dark:bg-[#0B1120]">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">
              CampusPark
            </h1>
            <p className="text-xs text-brand-200 mt-0.5">
              University Parking Network
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-md relative z-10">
          <h2 className="text-3xl font-display font-bold leading-tight">
            Register your vehicle permit and reserve slots instantly.
          </h2>

          <div className="space-y-3.5 pt-2 text-sm text-brand-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Automatic vehicle license plate gate sensor sync.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Role-tiered parking permits for Students, Faculty, and Staff.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Interactive real-time slot map with EV charger reservations.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Instant .ics calendar sync and mobile digital tickets.</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-brand-200 flex items-center justify-between">
          <span>Client-side mock registration stored in browser storage.</span>
          <DemoDataBadge />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
                CampusPark
              </span>
            </div>
            <DemoDataBadge />
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}

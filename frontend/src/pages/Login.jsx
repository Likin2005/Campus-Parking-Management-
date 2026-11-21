import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import { Car, ShieldCheck, Clock, Zap, MapPin } from 'lucide-react';

/**
 * Login.jsx - Authentication Page with Split-Screen Brand Layout.
 * UI/UX Principles:
 * - Nielsen #4 (Consistency & Standards): Clean standard split layout on desktop, single column on mobile.
 * - Visual Hierarchy: Brand promise on left, focused task form on right.
 */

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F8FB] dark:bg-[#0B1120]">
      {/* Left Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-500/20 blur-2xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">
              CampusPark
            </h1>
            <p className="text-xs text-brand-200 mt-0.5">
              Intelligent University Parking Network
            </p>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="space-y-6 max-w-md relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-brand-200 text-xs border border-white/15">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official University UI/UX Capstone Demonstration</span>
          </div>

          <h2 className="text-3xl font-display font-bold leading-tight">
            Effortless campus parking for students, faculty & guests.
          </h2>

          <div className="space-y-4 pt-2 text-sm text-brand-100">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
              <span>Real-time slot availability meters prevent campus gridlock and preserve class arrival times.</span>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span>Dedicated filter bays for EV charging, ADA accessibility, and covered garages.</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-sky-300 flex-shrink-0 mt-0.5" />
              <span>Direct walking distance estimates from parking decks to key campus buildings.</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-brand-200 flex items-center justify-between">
          <span>Simulated demo data & mock local authentication.</span>
          <DemoDataBadge />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
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

          <LoginForm />
        </div>
      </div>
    </div>
  );
}

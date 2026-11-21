import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Compass, Home, ArrowLeft } from 'lucide-react';

/**
 * NotFound.jsx - 404 Error Screen with Clear Recovery Paths.
 * UI/UX Principle: Help Users Recognize, Diagnose, and Recover from Errors (Nielsen #9).
 */

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center mb-6 shadow-soft">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
        Error 404 • Destination Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white mb-3">
        Looks Like You've Parked Off the Map
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The campus parking page or slot resource you requested does not exist or may have been relocated.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          icon={ArrowLeft}
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="primary"
          icon={Home}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

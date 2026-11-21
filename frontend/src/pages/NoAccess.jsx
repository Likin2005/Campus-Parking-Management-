import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ShieldAlert, Home, ArrowLeft, Key } from 'lucide-react';

/**
 * NoAccess.jsx - Friendly 403 Role-Based Restriction Screen.
 * UI/UX Principles:
 * - Nielsen #9 (Help Users Recover): Instead of a dead end, explains why access is denied and offers a demo bypass.
 * - Nielsen #2 (Match with Real World): Empathetic campus-centric messaging.
 */

export default function NoAccess() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleSwitchToAdmin = async () => {
    try {
      await login('admin@campus.edu', 'Admin@2026', true);
      navigate('/admin');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 shadow-soft">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
        Access Restricted • 403 Forbidden
      </span>

      <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white mb-3">
        Campus Facility Admin Privileges Required
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        You are currently signed in as{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {user?.name || 'a visitor'} ({user?.role || 'Guest'})
        </span>
        . Administrative deck management and maintenance overrides are restricted to Campus Operations personnel.
      </p>

      {/* Demo Switcher Helper Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full mb-8 text-xs text-left">
        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
          <Key className="w-3.5 h-3.5 text-purple-600" />
          <span>Demo Evaluation Shortcut:</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-3">
          To evaluate admin operations in this academic project, switch to the pre-seeded admin account.
        </p>
        <Button
          onClick={handleSwitchToAdmin}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          Switch to Admin Demo (Sarah Jenkins)
        </Button>
      </div>

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

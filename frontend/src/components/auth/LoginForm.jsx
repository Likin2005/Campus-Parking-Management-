import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePassword } from '../../utils/validators';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Lock, Mail, UserCheck, ShieldAlert, Sparkles, Compass } from 'lucide-react';

/**
 * LoginForm.jsx - Complete sign-in form with demo credential autofill and validation.
 * UI/UX Principles:
 * - Nielsen #9 (Error Prevention & Helpful Recovery): Real-time field blur errors with specific instructions.
 * - Nielsen #6 (Recognition Over Recall): Demo account helper cards remove credential memory burden.
 * - Honesty Rule: Prominently states that this is an educational mock demo with client-side session.
 */

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsVisitor } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Return destination if user was redirected from a protected route or booking attempt
  const returnTo = location.state?.from?.pathname || location.state?.returnTo || '/dashboard';
  const preservedSlot = location.state?.preserveSlot;
  const preservedZone = location.state?.preserveZone;

  // Validate on blur
  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: err }));
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: err }));
  };

  // Demo account autofill helper
  const handleAutofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      if (emailErr && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (passErr && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const loggedUser = await login(email, password, rememberMe);
      addToast({
        type: 'success',
        title: `Welcome back, ${loggedUser.name}!`,
        message: `Signed in as ${loggedUser.role}.`
      });

      // Navigate back with state if slot was preserved
      navigate(returnTo, {
        replace: true,
        state: preservedSlot ? { preserveSlot: preservedSlot, preserveZone: preservedZone } : undefined
      });
    } catch (err) {
      setErrors({ form: err.message || 'Login failed. Please verify your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisitorContinue = () => {
    loginAsVisitor();
    addToast({
      type: 'info',
      title: 'Browsing as Visitor',
      message: 'You have temporary guest privileges to view live slots and zones.'
    });
    navigate(returnTo, { replace: true });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Sign in to CampusPark
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your permits, reserve slots, and manage vehicle parking.
          </p>
        </div>

        {errors.form && (
          <div
            role="alert"
            className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 rounded-xl text-xs flex items-start gap-2"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="login-email"
            label="College Email"
            type="email"
            placeholder="name@campus.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            error={errors.email}
            icon={Mail}
            autoComplete="email"
            required
            ref={emailInputRef}
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            error={errors.password}
            icon={Lock}
            autoComplete="current-password"
            required
            ref={passwordInputRef}
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-brand-700 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
              />
              <span>Remember me</span>
            </label>

            <span className="text-xs text-slate-400">Demo student pass</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In
          </Button>

          {/* Continue as Visitor */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
                Or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleVisitorContinue}
            className="w-full"
            icon={Compass}
          >
            Continue as Visitor (Browse Only)
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link
            to="/signup"
            className="font-bold text-brand-700 dark:text-brand-400 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* Demo Account Quick-Fill Helper Card */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Try a demo account (Click to autofill)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleAutofill('student@campus.edu', 'Student@2026')}
            className="flex flex-col items-start p-2.5 bg-white dark:bg-slate-900 hover:border-brand-500 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition-all"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Student
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full">
              student@campus.edu
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAutofill('faculty@campus.edu', 'Faculty@2026')}
            className="flex flex-col items-start p-2.5 bg-white dark:bg-slate-900 hover:border-brand-500 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition-all"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Faculty
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full">
              faculty@campus.edu
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAutofill('admin@campus.edu', 'Admin@2026')}
            className="flex flex-col items-start p-2.5 bg-white dark:bg-slate-900 hover:border-brand-500 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition-all"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-purple-600" /> Admin
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full">
              admin@campus.edu
            </span>
          </button>
        </div>
      </div>

      {/* Honesty / Security Notice */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed px-2">
        <span className="font-semibold text-slate-500 dark:text-slate-400">Notice:</span> This is a frontend demo application. Authentication is simulated with mock accounts stored in browser storage. No real credentials or sensitive information should be entered.
      </div>
    </div>
  );
}

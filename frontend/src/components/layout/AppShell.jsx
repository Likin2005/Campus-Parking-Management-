import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import DemoDataBadge from '../ui/DemoDataBadge';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

/**
 * AppShell.jsx - Primary Layout Container with WCAG 2.4.1 Skip-to-Content Link.
 * UI/UX Principles:
 * - Accessibility (WCAG 2.4.1 Bypass Blocks): Provides direct keyboard skip to #main-content.
 * - Mobile-first responsive structure ensuring no horizontal scrollbars.
 * - Honesty Rule & Footer Disclaimers: Transparently details mock demo environment.
 */

export default function AppShell({ children }) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 antialiased">
      {/* WCAG Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-brand-700 focus:text-white focus:rounded-xl focus:shadow-elevated focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 font-semibold text-xs"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 focus:outline-none"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-display font-bold text-slate-800 dark:text-white text-sm">
              CampusPark
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>College UI/UX Subject Capstone Project</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <DemoDataBadge />
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/styleguide"
              className="text-brand-700 dark:text-brand-400 hover:underline font-medium"
            >
              UI/UX Styleguide
            </Link>
            <span>•</span>
            <span className="text-[11px] text-slate-400">
              Frontend Demo (Mock Auth & LocalStorage)
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation and Drawer */}
      <MobileNav
        isDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
      />
    </div>
  );
}

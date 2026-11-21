import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import DemoDataBadge from '../components/ui/DemoDataBadge';
import {
  User,
  Shield,
  Car,
  RotateCcw,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Building,
  Key
} from 'lucide-react';

/**
 * Profile.jsx - User Settings, Vehicle Management, and Demo Data Reset.
 * UI/UX Principles:
 * - Nielsen #3 (User Control and Freedom): Provides clear account settings and non-destructive reset.
 * - Nielsen #5 (Error Prevention): Modal protection before executing a full application state reset.
 */

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { resetDemoData } = useBookings();

  const [name, setName] = useState(user?.name || '');
  const [plate, setPlate] = useState(user?.vehicles?.[0]?.plate || '');
  const [model, setModel] = useState(user?.vehicles?.[0]?.model || '');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      vehicles: [{ plate: plate.toUpperCase().trim(), model, type: 'Standard' }]
    });
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setIsResetModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            Account Preferences
          </span>
          <DemoDataBadge />
        </div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your campus parking credentials, vehicle plates, and application demo storage.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <Card className="border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-700 text-white font-display font-bold text-2xl flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                {user?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user?.permitType || 'Active University Permit'}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            id="profile-name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="profile-plate"
              label="Primary Vehicle License Plate"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              icon={Car}
              hint="Checked automatically by gate sensors"
              required
            />

            <Input
              id="profile-model"
              label="Vehicle Make / Model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Honda Civic"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Demo Controls & Danger Zone */}
      <Card className="border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div>
          <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">
            Demo Management & Session
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reset demo data to initial pristine seeds or sign out of your mock session.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsResetModalOpen(true)}
            icon={RotateCcw}
          >
            Reset Demo Data
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            icon={LogOut}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Demo Data"
        description="This will restore all simulated zones, slots, users, and reservations back to their factory seeds in browser storage."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>
              Any custom slots added or bookings created will be replaced with the default deterministic dataset.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReset}>
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

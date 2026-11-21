import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookings } from '../../context/BookingContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import DemoDataBadge from '../../components/ui/DemoDataBadge';
import { Plus, Grid, Wrench, CheckCircle2, Ban, Clock, Filter } from 'lucide-react';

/**
 * ManageSlots.jsx - Admin Slot Maintenance & Availability Override Tool.
 * UI/UX Principles:
 * - Direct Manipulation: Instant status toggle (Available <-> Maintenance) with immediate visible feedback.
 * - Nielsen #1 (Visibility of System Status): Real-time updates reflect in user search without reload.
 */

export default function ManageSlots() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { zones, updateSlotStatus, addSlot } = useBookings();

  const [selectedZoneCode, setSelectedZoneCode] = useState(searchParams.get('zone') || 'A');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newSlotData, setNewSlotData] = useState({
    type: 'Standard',
    level: '1',
    pricePerHour: '2.00',
    notes: ''
  });

  const currentZone = zones.find((z) => z.code === selectedZoneCode) || zones[0];

  const handleZoneSelect = (code) => {
    setSelectedZoneCode(code);
    setSearchParams({ zone: code });
  };

  const handleCreateSlot = (e) => {
    e.preventDefault();
    if (!currentZone) return;

    addSlot(currentZone.id, {
      type: newSlotData.type,
      level: parseInt(newSlotData.level, 10) || 1,
      pricePerHour: parseFloat(newSlotData.pricePerHour) || 2.0,
      notes: newSlotData.notes
    });

    setIsAddModalOpen(false);
    setNewSlotData({
      type: 'Standard',
      level: '1',
      pricePerHour: '2.00',
      notes: ''
    });
  };

  if (!currentZone) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        <p className="text-sm animate-pulse">Loading parking slots from CouchDB...</p>
      </div>
    );
  }

  const filteredSlots = currentZone.slots.filter((slot) => {
    if (statusFilter !== 'all' && slot.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Admin Slot Operations
            </span>
            <DemoDataBadge />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Manage Slots — Zone {currentZone.code}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentZone.name} • Override slot status or flag bays for maintenance.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={Plus}
        >
          Add Slot to Zone {currentZone.code}
        </Button>
      </div>

      {/* Zone Switcher & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-soft">
        {/* Zone Selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Zone:
          </span>
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => handleZoneSelect(z.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                z.code === currentZone.code
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Zone {z.code}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[36px]"
          >
            <option value="all">All Slot Statuses</option>
            <option value="available">Available Only</option>
            <option value="occupied">Occupied Only</option>
            <option value="reserved">Reserved Only</option>
            <option value="disabled">Under Maintenance Only</option>
          </select>
        </div>
      </div>

      {/* Slots Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Slot</th>
                <th className="py-3.5 px-4">Bay Type</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Admin Override Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {slot.number}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {slot.type}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    Level {slot.level || 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={slot.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    {slot.notes || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {slot.status !== 'available' && (
                        <button
                          type="button"
                          onClick={() => updateSlotStatus(currentZone.id, slot.id, 'available')}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
                        >
                          Set Available
                        </button>
                      )}
                      {slot.status !== 'occupied' && (
                        <button
                          type="button"
                          onClick={() => updateSlotStatus(currentZone.id, slot.id, 'occupied')}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300"
                        >
                          Set Occupied
                        </button>
                      )}
                      {slot.status !== 'disabled' ? (
                        <button
                          type="button"
                          onClick={() => updateSlotStatus(currentZone.id, slot.id, 'disabled')}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-800 hover:bg-red-100 border border-red-300 flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Maintenance</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateSlotStatus(currentZone.id, slot.id, 'available')}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-300"
                        >
                          Clear Maintenance
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New Slot to Zone ${currentZone.code}`}
        description={`The slot will be created at the end of the Zone ${currentZone.code} sequence.`}
      >
        <form onSubmit={handleCreateSlot} className="space-y-4 pt-2">
          <Select
            id="slot-type"
            label="Bay Type"
            value={newSlotData.type}
            onChange={(e) => setNewSlotData({ ...newSlotData, type: e.target.value })}
            options={[
              { value: 'Standard', label: 'Standard Vehicle Bay' },
              { value: 'EV Charging', label: 'EV Charging Station' },
              { value: 'Accessible', label: 'Accessible (ADA compliant)' },
              { value: 'Compact', label: 'Compact Vehicle' },
              { value: 'Motorcycle', label: 'Motorcycle / Scooter' }
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="slot-level"
              label="Deck Level / Floor"
              type="number"
              min={1}
              max={5}
              value={newSlotData.level}
              onChange={(e) => setNewSlotData({ ...newSlotData, level: e.target.value })}
            />
            <Input
              id="slot-price"
              label="Hourly Rate ($)"
              type="number"
              step="0.5"
              value={newSlotData.pricePerHour}
              onChange={(e) => setNewSlotData({ ...newSlotData, pricePerHour: e.target.value })}
            />
          </div>

          <Input
            id="slot-notes"
            label="Administrative Notes (Optional)"
            type="text"
            placeholder="e.g. Near Stairwell C elevator"
            value={newSlotData.notes}
            onChange={(e) => setNewSlotData({ ...newSlotData, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

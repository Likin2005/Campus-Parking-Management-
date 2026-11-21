import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../context/BookingContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import DemoDataBadge from '../../components/ui/DemoDataBadge';
import { Plus, Layers, ArrowRight, ShieldCheck, Zap, Accessibility, MapPin } from 'lucide-react';

/**
 * ManageZones.jsx - Admin Zone Administration & Capacity Management.
 * UI/UX Principles:
 * - Nielsen #7 (Flexibility and Efficiency of Use): Fast tabular administration of zone capacities and configurations.
 * - Nielsen #5 (Error Prevention): Clear field constraints and validation prior to zone creation.
 */

export default function ManageZones() {
  const navigate = useNavigate();
  const { zones, addZone } = useBookings();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    tagline: '',
    type: 'Surface Lot',
    slotCount: '16',
    hourlyRate: '2.00',
    isCovered: false,
    hasEv: false,
    landmark: ''
  });
  const [formError, setFormError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setFormError('Zone code and name are required.');
      return;
    }

    const codeExists = zones.some((z) => z.code.toUpperCase() === formData.code.trim().toUpperCase());
    if (codeExists) {
      setFormError(`Zone code "${formData.code.toUpperCase()}" already exists.`);
      return;
    }

    addZone(formData);
    setIsAddModalOpen(false);
    setFormData({
      code: '',
      name: '',
      tagline: '',
      type: 'Surface Lot',
      slotCount: '16',
      hourlyRate: '2.00',
      isCovered: false,
      hasEv: false,
      landmark: ''
    });
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Admin Zone Administration
            </span>
            <DemoDataBadge />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Manage Parking Zones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define campus parking decks, update capacity, and control zone accessibility rules.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={Plus}
        >
          Add New Zone
        </Button>
      </div>

      {/* Zones Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Zone Name & Location</th>
                <th className="py-3.5 px-4">Deck Type</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Features</th>
                <th className="py-3.5 px-4">Rate</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {zones.map((zone) => {
                const total = zone.slots.length;
                const available = zone.slots.filter((s) => s.status === 'available').length;

                return (
                  <tr key={zone.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="w-8 h-8 rounded-lg bg-brand-700 text-white font-bold flex items-center justify-center font-mono">
                        {zone.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {zone.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        <span>{zone.landmark}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {zone.type}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <span className="text-emerald-600">{available}</span> / {total} slots
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {zone.isCovered && (
                          <span className="p-1 bg-slate-100 dark:bg-slate-800 rounded" title="Covered Deck">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                          </span>
                        )}
                        {zone.hasEv && (
                          <span className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded" title="EV Chargers">
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                        {zone.hasAccessible && (
                          <span className="p-1 bg-sky-50 dark:bg-sky-950/40 rounded" title="Accessible ADA">
                            <Accessibility className="w-3.5 h-3.5 text-sky-600" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      ${zone.hourlyRate?.toFixed(2) || '2.00'}/hr
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => navigate(`/admin/slots?zone=${zone.code}`)}
                        variant="ghost"
                        size="sm"
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        Slots
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Zone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Campus Parking Zone"
        description="Register a new parking deck or surface lot into the campus network."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="new-zone-code"
              label="Zone Code (Letter)"
              type="text"
              placeholder="e.g. G"
              maxLength={2}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <Input
              id="new-zone-slots"
              label="Initial Slot Count"
              type="number"
              min={4}
              max={60}
              value={formData.slotCount}
              onChange={(e) => setFormData({ ...formData, slotCount: e.target.value })}
              required
            />
          </div>

          <Input
            id="new-zone-name"
            label="Zone Full Title"
            type="text"
            placeholder="e.g. Zone G — West Campus Innovation Hub"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            id="new-zone-landmark"
            label="Location Landmark"
            type="text"
            placeholder="e.g. Near Biotech Pavilion Gate"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="new-zone-rate"
              label="Visitor Rate ($/hr)"
              type="number"
              step="0.5"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isCovered}
                  onChange={(e) => setFormData({ ...formData, isCovered: e.target.checked })}
                  className="rounded text-brand-700"
                />
                <span>Covered Structure</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.hasEv}
                  onChange={(e) => setFormData({ ...formData, hasEv: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Includes EV Chargers</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Zone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

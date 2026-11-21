/**
 * seedZones.js - Deterministic parking zones and slot seeds for CampusPark.
 * UI/UX Principle: Match with Real World (Nielsen Heuristic #2)
 * Zones and slots match typical university campus nomenclature and layouts.
 */

function generateSlots(zoneCode, count, overrides = {}) {
  const slots = [];
  for (let i = 1; i <= count; i++) {
    const numStr = String(i).padStart(2, '0');
    const slotId = `${zoneCode}-${numStr}`;

    // Deterministic distribution of slot types and initial states
    let type = 'Standard';
    if (i <= 3) type = 'Accessible';
    else if (i <= 6) type = 'EV Charging';
    else if (i <= 9) type = 'Compact';
    else if (i === count || i === count - 1) type = 'Motorcycle';

    let status = 'available';
    // Deterministic pattern: every 4th is occupied, every 7th is reserved, 1 disabled
    if (i === 13 || i === 22) {
      status = 'disabled';
    } else if (i % 4 === 0) {
      status = 'occupied';
    } else if (i % 7 === 0) {
      status = 'reserved';
    }

    // Apply any explicit overrides
    if (overrides[slotId]) {
      Object.assign(overrides[slotId]);
    }

    slots.push({
      id: slotId,
      number: slotId,
      zoneCode,
      type,
      status, // 'available' | 'occupied' | 'reserved' | 'disabled'
      level: i <= 15 ? 1 : 2,
      pricePerHour: type === 'EV Charging' ? 3.5 : 2.0,
      notes: status === 'disabled' ? 'Sensor calibration & resurfacing underway' : ''
    });
  }
  return slots;
}

export const SEED_ZONES = [
  {
    id: 'zone-a',
    code: 'A',
    name: 'Zone A — Engineering & Science Deck',
    tagline: 'Covered multi-level deck adjacent to Tech Tower and Lab Complex',
    type: 'Covered Deck',
    isCovered: true,
    hasEv: true,
    hasAccessible: true,
    distanceMinutes: 2,
    hourlyRate: 2.50,
    ratesInfo: 'Free with Student/Faculty Permit • $2.50/hr Visitor',
    landmark: 'Adjacent to Engineering Quad & Robotics Hall',
    slots: generateSlots('A', 26)
  },
  {
    id: 'zone-b',
    code: 'B',
    name: 'Zone B — North Residence & Dorms Lot',
    tagline: 'Spacious surface lot convenient for residential halls and dining commons',
    type: 'Surface Lot',
    isCovered: false,
    hasEv: true,
    hasAccessible: true,
    distanceMinutes: 4,
    hourlyRate: 1.50,
    ratesInfo: 'Resident Permits 24/7 • Visitor parking permitted 8am–6pm',
    landmark: 'Between Birch Hall and North Dining Court',
    slots: generateSlots('B', 30)
  },
  {
    id: 'zone-c',
    code: 'C',
    name: 'Zone C — Humanities & Central Library Garage',
    tagline: 'Central underground garage beneath the main learning commons and library',
    type: 'Underground',
    isCovered: true,
    hasEv: true,
    hasAccessible: true,
    distanceMinutes: 1,
    hourlyRate: 3.00,
    ratesInfo: 'All Permits Accepted • High EV charger density',
    landmark: 'Below William James Memorial Library',
    slots: generateSlots('C', 28)
  },
  {
    id: 'zone-d',
    code: 'D',
    name: 'Zone D — Athletics & Arena Complex',
    tagline: 'High-capacity perimeter lot designed for sports events and overflow',
    type: 'Surface Lot',
    isCovered: false,
    hasEv: false,
    hasAccessible: true,
    distanceMinutes: 6,
    hourlyRate: 1.00,
    ratesInfo: 'Free with any campus permit • Shuttle pick-up every 10 min',
    landmark: 'Next to Campus Stadium and Aquatic Pavilion',
    slots: generateSlots('D', 32)
  },
  {
    id: 'zone-e',
    code: 'E',
    name: 'Zone E — Health Sciences & Medical Annex',
    tagline: 'Dedicated clinic and lab parking with priority patient and faculty access',
    type: 'Covered Deck',
    isCovered: true,
    hasEv: true,
    hasAccessible: true,
    distanceMinutes: 3,
    hourlyRate: 2.00,
    ratesInfo: 'Priority Health Staff • Clinic visitors validated',
    landmark: 'West Wing of University Medical Center',
    slots: generateSlots('E', 24)
  },
  {
    id: 'zone-f',
    code: 'F',
    name: 'Zone F — Administration & Welcome Pavilion',
    tagline: 'Premium front-campus parking for admissions, visitors, and executive staff',
    type: 'Surface Lot',
    isCovered: false,
    hasEv: true,
    hasAccessible: true,
    distanceMinutes: 1,
    hourlyRate: 3.50,
    ratesInfo: 'Visitor pass required or Admin permit',
    landmark: 'Opposite Main Campus Gatehouse and Visitor Center',
    slots: generateSlots('F', 24)
  }
];

// Helper to compute live zone availability statistics
export function getZoneStats(zone) {
  const total = zone.slots.length;
  const available = zone.slots.filter(s => s.status === 'available').length;
  const occupied = zone.slots.filter(s => s.status === 'occupied').length;
  const reserved = zone.slots.filter(s => s.status === 'reserved').length;
  const disabled = zone.slots.filter(s => s.status === 'disabled').length;
  const percentAvailable = total > 0 ? Math.round((available / total) * 100) : 0;
  return { total, available, occupied, reserved, disabled, percentAvailable };
}

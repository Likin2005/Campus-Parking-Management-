/**
 * seedBookings.js - Realistic initial booking records for demo users.
 * UI/UX Principle: Visibility of System Status (Nielsen Heuristic #1)
 * Users can view their real reservation states immediately on first run.
 */

const now = new Date();

// Generate dates relative to current local time so the demo is always fresh and realistic
const futureDate1 = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
const futureDate1End = new Date(futureDate1.getTime() + 3 * 60 * 60 * 1000); // +3 hrs

const futureDate2 = new Date(now.getTime() + 26 * 60 * 60 * 1000); // Tomorrow
const futureDate2End = new Date(futureDate2.getTime() + 4 * 60 * 60 * 1000);

const pastDate1 = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
const pastDate1End = new Date(pastDate1.getTime() + 2 * 60 * 60 * 1000);

const pastDate2 = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 3 days ago
const pastDate2End = new Date(pastDate2.getTime() + 4 * 60 * 60 * 1000);

const cancelledDate = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 2 days ago
const cancelledDateEnd = new Date(cancelledDate.getTime() + 3 * 60 * 60 * 1000);

export const SEED_BOOKINGS = [
  {
    id: 'BK-98421',
    userId: 'user-student-1', // Maya Lin
    userName: 'Maya Lin',
    userRole: 'Student',
    zoneId: 'zone-a',
    zoneName: 'Zone A — Engineering & Science Deck',
    slotId: 'A-07',
    slotNumber: 'A-07',
    slotType: 'Standard',
    licensePlate: 'ABC-1234',
    vehicleModel: 'Honda Civic (Silver)',
    startIso: futureDate1.toISOString(),
    endIso: futureDate1End.toISOString(),
    status: 'upcoming', // 'upcoming' | 'completed' | 'cancelled'
    permitUsed: 'Semester Student Pass',
    rateCharged: 0.00,
    createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-98422',
    userId: 'user-faculty-1', // Dr. Vance
    userName: 'Dr. Arthur Vance',
    userRole: 'Faculty',
    zoneId: 'zone-c',
    zoneName: 'Zone C — Humanities & Central Library Garage',
    slotId: 'C-04',
    slotNumber: 'C-04',
    slotType: 'EV Charging',
    licensePlate: 'FAC-9081',
    vehicleModel: 'Toyota Prius Prime',
    startIso: futureDate2.toISOString(),
    endIso: futureDate2End.toISOString(),
    status: 'upcoming',
    permitUsed: 'Faculty Reserved Pass',
    rateCharged: 0.00,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-87310',
    userId: 'user-student-1',
    userName: 'Maya Lin',
    userRole: 'Student',
    zoneId: 'zone-b',
    zoneName: 'Zone B — North Residence & Dorms Lot',
    slotId: 'B-11',
    slotNumber: 'B-11',
    slotType: 'Standard',
    licensePlate: 'ABC-1234',
    vehicleModel: 'Honda Civic (Silver)',
    startIso: pastDate1.toISOString(),
    endIso: pastDate1End.toISOString(),
    status: 'completed',
    permitUsed: 'Semester Student Pass',
    rateCharged: 0.00,
    createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-85124',
    userId: 'user-student-1',
    userName: 'Maya Lin',
    userRole: 'Student',
    zoneId: 'zone-a',
    zoneName: 'Zone A — Engineering & Science Deck',
    slotId: 'A-02',
    slotNumber: 'A-02',
    slotType: 'Accessible',
    licensePlate: 'ABC-1234',
    vehicleModel: 'Honda Civic (Silver)',
    startIso: pastDate2.toISOString(),
    endIso: pastDate2End.toISOString(),
    status: 'completed',
    permitUsed: 'Semester Student Pass',
    rateCharged: 0.00,
    createdAt: new Date(now.getTime() - 80 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-77401',
    userId: 'user-student-1',
    userName: 'Maya Lin',
    userRole: 'Student',
    zoneId: 'zone-f',
    zoneName: 'Zone F — Administration & Welcome Pavilion',
    slotId: 'F-05',
    slotNumber: 'F-05',
    slotType: 'Compact',
    licensePlate: 'ABC-1234',
    vehicleModel: 'Honda Civic (Silver)',
    startIso: cancelledDate.toISOString(),
    endIso: cancelledDateEnd.toISOString(),
    status: 'cancelled',
    permitUsed: 'Semester Student Pass',
    rateCharged: 0.00,
    cancelledAt: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString(),
    cancelReason: 'Lecture rescheduled online',
    createdAt: new Date(now.getTime() - 55 * 60 * 60 * 1000).toISOString()
  }
];

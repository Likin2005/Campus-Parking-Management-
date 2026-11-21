/**
 * seedUsers.js - Seed demo users with deterministic mock credentials.
 * 
 * DISCLAIMER (FRONTEND DEMO ONLY):
 * This is a frontend-only educational demo. Passwords are mock strings stored locally
 * in browser localStorage/sessionStorage. This is NOT production-grade authentication.
 */

export const SEED_USERS = [
  {
    id: 'user-student-1',
    name: 'Maya Lin',
    email: 'student@campus.edu',
    password: 'Student@2026',
    role: 'Student',
    department: 'Computer Science',
    vehicles: [
      { plate: 'ABC-1234', model: 'Honda Civic (Silver)', type: 'Standard' }
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    permitType: 'Semester Student Pass #STU-9921'
  },
  {
    id: 'user-faculty-1',
    name: 'Dr. Arthur Vance',
    email: 'faculty@campus.edu',
    password: 'Faculty@2026',
    role: 'Faculty',
    department: 'Electrical Engineering',
    vehicles: [
      { plate: 'FAC-9081', model: 'Toyota Prius Prime (Blue EV)', type: 'EV' }
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    permitType: 'Faculty Reserved Pass #FAC-4402'
  },
  {
    id: 'user-admin-1',
    name: 'Sarah Jenkins',
    email: 'admin@campus.edu',
    password: 'Admin@2026',
    role: 'Admin',
    department: 'Campus Facilities & Transportation',
    vehicles: [
      { plate: 'ADM-0001', model: 'Subaru Outback (Navy)', type: 'Standard' }
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    permitType: 'Campus Operations Administrator'
  },
  {
    id: 'user-staff-1',
    name: 'David Miller',
    email: 'staff@campus.edu',
    password: 'Staff@2026',
    role: 'Staff',
    department: 'Student Affairs',
    vehicles: [
      { plate: 'STF-4412', model: 'Ford Focus (White)', type: 'Standard' }
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    permitType: 'Staff Regular #STF-1029'
  },
  {
    id: 'user-visitor-1',
    name: 'Jordan Lee',
    email: 'visitor@campus.edu',
    password: 'Visitor@2026',
    role: 'Visitor',
    department: 'Guest / Guest Speaker',
    vehicles: [
      { plate: 'VIS-5520', model: 'Tesla Model 3 (Black)', type: 'EV' }
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    permitType: 'Daily Visitor Permit'
  }
];

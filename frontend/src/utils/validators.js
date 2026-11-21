/**
 * validators.js - Form validation and conflict detection utilities.
 * UI/UX Principle: Error Prevention & Helpful Error Messages (Nielsen Heuristics #5 & #9).
 * Specific error messages provide actionable guidance rather than generic failure alerts.
 */

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Enter a valid email address like name@campus.edu';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return null;
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: 'Too short', color: 'bg-slate-200 text-slate-500' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500 text-red-600' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500 text-amber-600' };
    case 3:
      return { score: 3, label: 'Good', color: 'bg-blue-500 text-blue-600' };
    case 4:
      return { score: 4, label: 'Strong', color: 'bg-emerald-500 text-emerald-600' };
    default:
      return { score: 0, label: 'Too weak', color: 'bg-slate-200 text-slate-500' };
  }
}

export function validateLicensePlate(plate) {
  if (!plate || !plate.trim()) {
    return 'Vehicle plate number is required.';
  }
  const clean = plate.trim().toUpperCase();
  if (clean.length < 3 || clean.length > 10) {
    return 'License plate should be 3–10 characters (e.g. ABC-1234).';
  }
  return null;
}

export function validateName(name) {
  if (!name || !name.trim()) {
    return 'Full name is required.';
  }
  if (name.trim().length < 2) {
    return 'Please enter your full name (at least 2 letters).';
  }
  return null;
}

/**
 * Checks whether a proposed time interval [startIso, endIso] overlaps with another interval [otherStartIso, otherEndIso].
 * Interval overlap rule: max(startA, startB) < min(endA, endB)
 */
export function hasTimeOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

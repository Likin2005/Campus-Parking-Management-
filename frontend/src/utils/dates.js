/**
 * dates.js - Date formatting and timeline helpers without external heavy dependencies.
 * UI/UX Principle: Recognition Over Recall & Real-World Match (Nielsen Heuristics #2 & #6).
 * Clear human-readable timestamps reduce cognitive load.
 */

export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  return `${formatDate(isoString)} at ${formatTime(isoString)}`;
}

export function formatTimeRange(startIso, endIso) {
  if (!startIso || !endIso) return '';
  return `${formatDate(startIso)}, ${formatTime(startIso)} – ${formatTime(endIso)}`;
}

export function isPastDate(isoString) {
  if (!isoString) return false;
  return new Date(isoString).getTime() < Date.now();
}

/**
 * Returns ISO strings for a default booking window (e.g. Next full hour for 2 hours)
 */
export function getDefaultBookingWindow() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(now.getHours() + 1, 0, 0, 0); // Next top of hour

  const end = new Date(start);
  end.setHours(start.getHours() + 2); // 2-hour duration by default

  const toInputDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toInputTime = (d) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return {
    date: toInputDate(start),
    startTime: toInputTime(start),
    endTime: toInputTime(end),
    startIso: start.toISOString(),
    endIso: end.toISOString()
  };
}

export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  // dateStr is 'YYYY-MM-DD', timeStr is 'HH:MM'
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return d.toISOString();
}

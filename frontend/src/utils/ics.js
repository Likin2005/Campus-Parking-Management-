/**
 * ics.js - Generates RFC 5545 compliant iCalendar (.ics) files for parking bookings.
 * UI/UX Principle: Match between System & Real World (Nielsen Heuristic #2)
 * Empowering users to add campus events into their personal calendars (Google, Apple, Outlook).
 */

function formatIcsDate(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

export function generateIcsContent(booking) {
  const { id, slotNumber, zoneName, startIso, endIso, licensePlate } = booking;
  const now = formatIcsDate(new Date().toISOString());
  const dtStart = formatIcsDate(startIso);
  const dtEnd = formatIcsDate(endIso);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusPark//Campus Parking Management System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${id}@campuspark.edu`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:CampusPark: Slot ${slotNumber} (${zoneName})`,
    `DESCRIPTION:Campus Parking Reservation for slot ${slotNumber} in ${zoneName}. Vehicle: ${licensePlate || 'N/A'}. Reservation ID: ${id}. Please arrive promptly.`,
    `LOCATION:${zoneName}, University Campus Grounds`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadIcsFile(booking) {
  const content = generateIcsContent(booking);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `campuspark-${booking.slotNumber || 'slot'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

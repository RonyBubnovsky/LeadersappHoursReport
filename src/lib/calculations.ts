/**
 * Time calculation utilities for the Hours Tracker.
 */

/**
 * Parses a time string (HH:MM) into hours and minutes.
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

/**
 * Converts hours and minutes to total minutes.
 */
export function toMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

/**
 * Formats minutes back to HH:MM string.
 */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(Math.abs(totalMinutes) / 60)
  const minutes = Math.abs(totalMinutes) % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Calculates the duration between start and end times.
 * Handles overnight shifts (when end time is before start time).
 * 
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Object with total_hours (HH:MM) and pay_hours (decimal)
 */
export function calculateDuration(
  startTime: string,
  endTime: string
): { total_hours: string; pay_hours: number } {
  const start = parseTime(startTime)
  const end = parseTime(endTime)

  let startMinutes = toMinutes(start.hours, start.minutes)
  let endMinutes = toMinutes(end.hours, end.minutes)

  // Handle overnight shift
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60
  }

  const durationMinutes = endMinutes - startMinutes
  const total_hours = formatDuration(durationMinutes)
  const pay_hours = Math.round((durationMinutes / 60) * 100) / 100

  return { total_hours, pay_hours }
}

/**
 * Validates that a time string is in HH:MM format.
 */
export function isValidTime(timeStr: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(timeStr)
}

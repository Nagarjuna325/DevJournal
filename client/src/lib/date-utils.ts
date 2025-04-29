import { format, formatDistanceToNow, isToday, isYesterday, addDays, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';

/**
 * Format a date to display friendly format
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return format(dateObj, 'MMMM d, yyyy');
  }
}

/**
 * Format a date to display time
 * @param date The date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
}

/**
 * Format a date for API calls
 * @param date The date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get relative time from now
 * @param date The date to compare
 * @returns Human-readable relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Get the start of day for a date
 * @param date The date to use
 * @returns Date object set to start of day
 */
export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

/**
 * Get the end of day for a date
 * @param date The date to use
 * @returns Date object set to end of day
 */
export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

/**
 * Check if two dates are the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if dates are the same day
 */
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return isSameDay(d1, d2);
}

/**
 * Navigate to the next day
 * @param date The current date
 * @returns Date object for the next day
 */
export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

/**
 * Navigate to the previous day
 * @param date The current date
 * @returns Date object for the previous day
 */
export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

/**
 * Format month and year for calendar display
 * @param date The date to format
 * @returns Formatted month and year string
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

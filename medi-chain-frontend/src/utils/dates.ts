import { format, formatDistanceToNow, parseISO, isToday, isYesterday, isThisYear } from 'date-fns';

/**
 * Format a date to a human-readable string
 * @param date The date to format (can be a Date object, timestamp, or ISO string)
 * @returns Formatted date string (e.g., "Today at 2:30 PM", "Yesterday at 10:00 AM", "Mar 15, 2023")
 */
export const formatDate = (date: Date | number | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isThisYear(dateObj)) {
    return format(dateObj, 'MMM d, h:mm a');
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Format a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date The date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | number | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format a date to a short date string (e.g., "Mar 15, 2023")
 * @param date The date to format
 * @returns Short date string
 */
export const formatShortDate = (date: Date | number | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Format a date to a time string (e.g., "2:30 PM")
 * @param date The date to format
 * @returns Time string
 */
export const formatTime = (date: Date | number | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(dateObj, 'h:mm a');
};

/**
 * Format a duration in seconds to a human-readable string (e.g., "2h 30m", "1d 5h")
 * @param seconds The duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
};

/**
 * Parse a date string in the format expected by date inputs (YYYY-MM-DD)
 * @param dateString The date string to parse
 * @returns A Date object
 */
export const parseInputDate = (dateString: string): Date => {
  // If the date string is in ISO format, parse it directly
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  
  // Otherwise, assume it's in YYYY-MM-DD format and create a date at midnight UTC
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Format a date to the format expected by date inputs (YYYY-MM-DD)
 * @param date The date to format
 * @returns A string in YYYY-MM-DD format
 */
export const formatInputDate = (date: Date | number | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Check if a date is in the future
 * @param date The date to check
 * @returns True if the date is in the future
 */
export const isFutureDate = (date: Date | number | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return dateObj > new Date();
};

/**
 * Check if a date is in the past
 * @param date The date to check
 * @returns True if the date is in the past
 */
export const isPastDate = (date: Date | number | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return dateObj < new Date();
};

/**
 * Get the start of the day for a given date
 * @param date The date
 * @returns A new Date object set to the start of the day (00:00:00)
 */
export const startOfDay = (date: Date | number | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  const start = new Date(dateObj);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Get the end of the day for a given date
 * @param date The date
 * @returns A new Date object set to the end of the day (23:59:59.999)
 */
export const endOfDay = (date: Date | number | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  const end = new Date(dateObj);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Calculate the difference in days between two dates
 * @param date1 The first date
 * @param date2 The second date
 * @returns The difference in days (positive if date2 is after date1, negative otherwise)
 */
export const differenceInDays = (
  date1: Date | number | string,
  date2: Date | number | string
): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1);
  const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2);
  
  // Convert both dates to midnight UTC to compare just the date part
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

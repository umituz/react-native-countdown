/**
 * Countdown Utilities
 * 
 * Core utility functions for calculating and formatting countdown timers.
 * Works with any date/time format and provides flexible formatting options.
 * 
 * Timezone-aware: All date operations respect device timezone for accurate
 * daily/hourly limit calculations.
 */

import { timezoneService } from '@umituz/react-native-timezone';

export interface TimeRemaining {
  /** Hours remaining */
  hours: number;
  /** Minutes remaining */
  minutes: number;
  /** Seconds remaining */
  seconds: number;
  /** Total seconds remaining */
  totalSeconds: number;
  /** Whether the countdown has expired */
  isExpired: boolean;
}

export interface CountdownFormatOptions {
  /** Show seconds when less than this many minutes remain (default: 5) */
  showSecondsThreshold?: number;
  /** Separator between time units (default: " ") */
  separator?: string;
  /** Whether to show zero values (default: false) */
  showZeros?: boolean;
  /** Timezone for date calculations (defaults to device timezone) */
  timezone?: string;
}

export interface TranslationOptions {
  /** Translation function for i18n support */
  t?: (key: string, params?: Record<string, unknown>) => string;
  /** Translation keys mapping */
  keys?: {
    availableNow?: string;
    oneHour?: string;
    hours?: string;
    oneMinute?: string;
    minutes?: string;
    oneSecond?: string;
    seconds?: string;
  };
}

/**
 * Calculate time remaining until target date
 * 
 * Timezone-aware: Uses device timezone for accurate calculations.
 * The difference is always calculated in UTC milliseconds for consistency.
 * 
 * @param targetDate - ISO date string or Date object of target time
 * @param options - Optional timezone for calculations
 * @returns Object with hours, minutes, seconds remaining and expiration status
 * 
 * @example
 * ```typescript
 * const remaining = calculateTimeRemaining('2024-12-31T23:59:59Z');
 * console.log(remaining.hours); // 5
 * console.log(remaining.minutes); // 30
 * console.log(remaining.isExpired); // false
 * ```
 */
export function calculateTimeRemaining(
  targetDate: string | Date,
  options?: { timezone?: string },
): TimeRemaining {
  // Always use UTC milliseconds for accurate time difference calculation
  // This ensures consistent results regardless of timezone
  const now = new Date().getTime();
  const target = typeof targetDate === 'string' 
    ? new Date(targetDate).getTime() 
    : targetDate.getTime();
  const difference = Math.max(0, target - now);

  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired,
  };
}

/**
 * Format countdown as human-readable string with optional i18n support
 * 
 * @param targetDate - ISO date string or Date object of target time
 * @param options - Formatting and translation options
 * @returns Formatted countdown string (e.g., "2 hours 30 minutes" or "5 minutes 30 seconds")
 * 
 * @example
 * ```typescript
 * // Basic usage
 * formatCountdown('2024-12-31T23:59:59Z');
 * // "2 hours 30 minutes"
 * 
 * // With translation
 * formatCountdown('2024-12-31T23:59:59Z', {
 *   t: (key) => translations[key],
 *   keys: {
 *     hours: '{{count}} hours',
 *     minutes: '{{count}} minutes'
 *   }
 * });
 * ```
 */
export function formatCountdown(
  targetDate: string | Date,
  options?: CountdownFormatOptions & TranslationOptions,
): string {
  const {
    showSecondsThreshold = 5,
    separator = ' ',
    showZeros = false,
    t,
    keys,
  } = options || {};

  const { hours, minutes, seconds, totalSeconds, isExpired } = 
    calculateTimeRemaining(targetDate, { timezone: options?.timezone });

  if (isExpired) {
    const availableNowKey = keys?.availableNow || 'Available now';
    return t ? t(availableNowKey) : availableNowKey;
  }

  const parts: string[] = [];

  // Hours
  if (hours > 0 || showZeros) {
    if (hours === 1) {
      const oneHourKey = keys?.oneHour || '1 hour';
      parts.push(t ? t(oneHourKey) : oneHourKey);
    } else if (hours > 0) {
      const hoursKey = keys?.hours || '{{count}} hours';
      const formatted = hoursKey.replace('{{count}}', hours.toString());
      parts.push(t ? t(hoursKey, { count: hours }) : formatted);
    }
  }

  // Minutes
  if (minutes > 0 || (showZeros && hours === 0)) {
    if (minutes === 1) {
      const oneMinuteKey = keys?.oneMinute || '1 minute';
      parts.push(t ? t(oneMinuteKey) : oneMinuteKey);
    } else if (minutes > 0) {
      const minutesKey = keys?.minutes || '{{count}} minutes';
      const formatted = minutesKey.replace('{{count}}', minutes.toString());
      parts.push(t ? t(minutesKey, { count: minutes }) : formatted);
    }
  }

  // Seconds (only if less than threshold)
  if (hours === 0 && minutes < showSecondsThreshold) {
    if (seconds > 0 || showZeros) {
      if (seconds === 1) {
        const oneSecondKey = keys?.oneSecond || '1 second';
        parts.push(t ? t(oneSecondKey) : oneSecondKey);
      } else if (seconds > 0) {
        const secondsKey = keys?.seconds || '{{count}} seconds';
        const formatted = secondsKey.replace('{{count}}', seconds.toString());
        parts.push(t ? t(secondsKey, { count: seconds }) : formatted);
      }
    }
  }

  if (parts.length === 0) {
    const availableNowKey = keys?.availableNow || 'Available now';
    return t ? t(availableNowKey) : availableNowKey;
  }

  return parts.join(separator);
}

/**
 * Format countdown as short string (e.g., "2h 30m" or "5m 30s")
 * 
 * @param targetDate - ISO date string or Date object of target time
 * @param options - Formatting options
 * @returns Short formatted countdown string
 * 
 * @example
 * ```typescript
 * formatCountdownShort('2024-12-31T23:59:59Z');
 * // "2h 30m"
 * 
 * formatCountdownShort('2024-12-31T23:59:59Z', { showSecondsThreshold: 10 });
 * // "5m 30s"
 * ```
 */
export function formatCountdownShort(
  targetDate: string | Date,
  options?: CountdownFormatOptions,
): string {
  const {
    showSecondsThreshold = 5,
    separator = ' ',
  } = options || {};

  const { hours, minutes, seconds, totalSeconds, isExpired } = 
    calculateTimeRemaining(targetDate, { timezone: options?.timezone });

  if (isExpired) {
    return '0m';
  }

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  // Show seconds if less than threshold
  if (hours === 0 && minutes < showSecondsThreshold) {
    if (seconds > 0) {
      parts.push(`${seconds}s`);
    }
  }

  return parts.length > 0 ? parts.join(separator) : '0m';
}

/**
 * Format countdown as compact string (e.g., "2:30:00" or "5:30")
 * 
 * @param targetDate - ISO date string or Date object of target time
 * @param options - Formatting options
 * @returns Compact formatted countdown string (HH:MM:SS or MM:SS)
 * 
 * @example
 * ```typescript
 * formatCountdownCompact('2024-12-31T23:59:59Z');
 * // "2:30:00"
 * 
 * formatCountdownCompact('2024-12-31T23:59:59Z', { showHours: false });
 * // "150:00" (total minutes)
 * ```
 */
export function formatCountdownCompact(
  targetDate: string | Date,
  options?: CountdownFormatOptions & {
    /** Whether to show hours (default: true) */
    showHours?: boolean;
    /** Whether to show seconds (default: true) */
    showSeconds?: boolean;
  },
): string {
  const { showHours = true, showSeconds = true } = options || {};
  const { hours, minutes, seconds, isExpired } = calculateTimeRemaining(targetDate);

  if (isExpired) {
    return showHours ? '0:00:00' : '0:00';
  }

  if (showHours) {
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = showSeconds ? seconds.toString().padStart(2, '0') : '';
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  }

  const totalMinutes = hours * 60 + minutes;
  const m = totalMinutes.toString().padStart(2, '0');
  const s = showSeconds ? seconds.toString().padStart(2, '0') : '';
  return showSeconds ? `${m}:${s}` : `${m}`;
}

/**
 * Get next day start time (midnight of next day) in device timezone
 * Useful for daily limit resets
 * 
 * Timezone-aware: Returns midnight of next day in the device's local timezone,
 * then converts to ISO string for consistent storage.
 * 
 * @param date - Optional date to calculate from (defaults to now)
 * @returns ISO date string of next day midnight in device timezone
 * 
 * @example
 * ```typescript
 * // If device is in Europe/Istanbul (UTC+3)
 * const nextDay = getNextDayStartTime();
 * // Returns ISO string representing 00:00:00 tomorrow in Istanbul timezone
 * ```
 */
export function getNextDayStartTime(date?: Date): string {
  const baseDate = date || new Date();
  
  // Get start of today in device timezone
  const todayStart = timezoneService.startOfDay(baseDate);
  
  // Add one day to get tomorrow's start
  const tomorrowStart = timezoneService.addDays(todayStart, 1);
  
  // Convert to ISO string (preserves timezone information)
  return timezoneService.formatToISOString(tomorrowStart);
}

/**
 * Get next hour start time in device timezone
 * Useful for hourly limit resets
 * 
 * Timezone-aware: Returns start of next hour in the device's local timezone,
 * then converts to ISO string for consistent storage.
 * 
 * @param date - Optional date to calculate from (defaults to now)
 * @returns ISO date string of next hour start in device timezone
 * 
 * @example
 * ```typescript
 * // If current time is 14:30 in device timezone
 * const nextHour = getNextHourStartTime();
 * // Returns ISO string representing 15:00:00 in device timezone
 * ```
 */
export function getNextHourStartTime(date?: Date): string {
  const baseDate = date || new Date();
  const nextHour = new Date(baseDate);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  
  // Convert to ISO string (preserves timezone information)
  return timezoneService.formatToISOString(nextHour);
}


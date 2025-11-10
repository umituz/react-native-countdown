/**
 * useCountdown Hook
 * 
 * React hook for real-time countdown updates with automatic refresh
 */

import { useEffect, useState, useCallback } from 'react';
import {
  calculateTimeRemaining,
  formatCountdown,
  formatCountdownShort,
  formatCountdownCompact,
  type TimeRemaining,
  type CountdownFormatOptions,
  type TranslationOptions,
} from '../../utils/countdownUtils';

export interface UseCountdownOptions extends CountdownFormatOptions, TranslationOptions {
  /** Update interval in milliseconds (default: 1000) */
  interval?: number;
  /** Whether to start the countdown immediately (default: true) */
  autoStart?: boolean;
  /** Callback when countdown expires */
  onExpire?: () => void;
}

export interface UseCountdownReturn {
  /** Current time remaining object */
  timeRemaining: TimeRemaining;
  /** Formatted countdown string */
  formatted: string;
  /** Short formatted countdown string */
  short: string;
  /** Compact formatted countdown string */
  compact: string;
  /** Whether countdown is active */
  isActive: boolean;
  /** Start the countdown */
  start: () => void;
  /** Stop the countdown */
  stop: () => void;
  /** Reset the countdown with new target date */
  reset: (newTargetDate: string | Date) => void;
}

/**
 * React hook for real-time countdown with automatic updates
 * 
 * @param targetDate - ISO date string or Date object of target time
 * @param options - Countdown options (formatting, translation, callbacks)
 * @returns Countdown state and control functions
 * 
 * @example
 * ```typescript
 * const { formatted, timeRemaining, isActive } = useCountdown(
 *   '2024-12-31T23:59:59Z',
 *   {
 *     t: (key) => translations[key],
 *     onExpire: () => console.log('Countdown expired!')
 *   }
 * );
 * ```
 */
export function useCountdown(
  targetDate: string | Date | null | undefined,
  options?: UseCountdownOptions,
): UseCountdownReturn {
  const {
    interval = 1000,
    autoStart = true,
    onExpire,
    ...formatOptions
  } = options || {};

  const [currentTarget, setCurrentTarget] = useState<string | Date | null>(
    targetDate || null,
  );
  const [isActive, setIsActive] = useState(autoStart);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => {
    if (!currentTarget) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      };
    }
    return calculateTimeRemaining(currentTarget, { timezone: formatOptions?.timezone });
  });

  // Update countdown
  const updateCountdown = useCallback(() => {
    if (!currentTarget) {
      setTimeRemaining({
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      });
      return;
    }

    const remaining = calculateTimeRemaining(currentTarget, { timezone: formatOptions?.timezone });
    setTimeRemaining(remaining);

    // Call onExpire callback when countdown expires
    if (remaining.isExpired && onExpire) {
      onExpire();
    }
  }, [currentTarget, onExpire, formatOptions?.timezone]);

  // Effect for automatic updates
  useEffect(() => {
    if (!isActive || !currentTarget) {
      return;
    }

    // Update immediately
    updateCountdown();

    // Set up interval
    const intervalId = setInterval(updateCountdown, interval);

    return () => clearInterval(intervalId);
  }, [isActive, currentTarget, interval, updateCountdown]);

  // Update when targetDate prop changes
  useEffect(() => {
    if (targetDate !== undefined) {
      setCurrentTarget(targetDate || null);
      updateCountdown();
    }
  }, [targetDate, updateCountdown]);

  // Control functions
  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((newTargetDate: string | Date) => {
    setCurrentTarget(newTargetDate);
    setIsActive(true);
    updateCountdown();
  }, [updateCountdown]);

  // Format strings
  const formatted = currentTarget
    ? formatCountdown(currentTarget, formatOptions)
    : '';
  const short = currentTarget
    ? formatCountdownShort(currentTarget, formatOptions)
    : '';
  const compact = currentTarget
    ? formatCountdownCompact(currentTarget, formatOptions)
    : '';

  return {
    timeRemaining,
    formatted,
    short,
    compact,
    isActive,
    start,
    stop,
    reset,
  };
}


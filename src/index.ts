/**
 * React Native Countdown - Public API
 * 
 * Countdown utilities and React hooks for React Native apps.
 * Provides time formatting, real-time updates, and i18n support.
 * 
 * Usage:
 *   import { useCountdown, formatCountdown, calculateTimeRemaining } from '@umituz/react-native-countdown';
 */

// =============================================================================
// UTILITIES - Core Functions
// =============================================================================

export {
  calculateTimeRemaining,
  formatCountdown,
  formatCountdownShort,
  formatCountdownCompact,
  getNextDayStartTime,
  getNextHourStartTime,
} from './utils/countdownUtils';

export type {
  TimeRemaining,
  CountdownFormatOptions,
  TranslationOptions,
} from './utils/countdownUtils';

// =============================================================================
// PRESENTATION LAYER - React Hooks
// =============================================================================

export {
  useCountdown,
} from './presentation/hooks/useCountdown';

export type {
  UseCountdownOptions,
  UseCountdownReturn,
} from './presentation/hooks/useCountdown';


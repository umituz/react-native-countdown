# @umituz/react-native-countdown

Countdown utilities and React hooks for React Native apps with time formatting and real-time updates.

## Installation

```bash
npm install @umituz/react-native-countdown
```

## Peer Dependencies

- `react` >= 18.2.0
- `react-native` >= 0.74.0
- `@umituz/react-native-timezone` >= 1.0.0

## Features

- ✅ Real-time countdown updates with React hooks
- ✅ Multiple formatting options (human-readable, short, compact)
- ✅ i18n support with translation functions
- ✅ **Timezone-aware**: All date operations respect device timezone
- ✅ Flexible date/time input (ISO strings or Date objects)
- ✅ Automatic expiration handling
- ✅ Utility functions for common time calculations
- ✅ TypeScript support with full type definitions

## Usage

### Basic Hook Usage

```typescript
import { useCountdown } from '@umituz/react-native-countdown';

const MyComponent = () => {
  const { formatted, timeRemaining, isActive } = useCountdown(
    '2024-12-31T23:59:59Z'
  );

  return (
    <View>
      <Text>{formatted}</Text>
      <Text>Hours: {timeRemaining.hours}</Text>
      <Text>Minutes: {timeRemaining.minutes}</Text>
      <Text>Expired: {timeRemaining.isExpired ? 'Yes' : 'No'}</Text>
    </View>
  );
};
```

### With Translation Support

```typescript
import { useCountdown } from '@umituz/react-native-countdown';
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  const { formatted } = useCountdown('2024-12-31T23:59:59Z', {
    t: (key, params) => t(key, params),
    keys: {
      hours: 'countdown.hours',
      minutes: 'countdown.minutes',
      availableNow: 'countdown.availableNow',
    },
  });

  return <Text>{formatted}</Text>;
};
```

### With Callbacks

```typescript
import { useCountdown } from '@umituz/react-native-countdown';

const MyComponent = () => {
  const { formatted, stop, reset } = useCountdown(
    '2024-12-31T23:59:59Z',
    {
      onExpire: () => {
        console.log('Countdown expired!');
        // Handle expiration
      },
    }
  );

  return (
    <View>
      <Text>{formatted}</Text>
      <Button onPress={stop} title="Stop" />
      <Button onPress={() => reset('2025-01-01T00:00:00Z')} title="Reset" />
    </View>
  );
};
```

### Utility Functions

```typescript
import {
  calculateTimeRemaining,
  formatCountdown,
  formatCountdownShort,
  formatCountdownCompact,
  getNextDayStartTime,
} from '@umituz/react-native-countdown';

// Calculate time remaining
const remaining = calculateTimeRemaining('2024-12-31T23:59:59Z');
console.log(remaining.hours); // 5
console.log(remaining.minutes); // 30
console.log(remaining.isExpired); // false

// Format countdown
const formatted = formatCountdown('2024-12-31T23:59:59Z');
console.log(formatted); // "5 hours 30 minutes"

// Short format
const short = formatCountdownShort('2024-12-31T23:59:59Z');
console.log(short); // "5h 30m"

// Compact format
const compact = formatCountdownCompact('2024-12-31T23:59:59Z');
console.log(compact); // "5:30:00"

// Get next day start (useful for daily limits)
const nextDay = getNextDayStartTime();
console.log(nextDay); // "2024-12-26T00:00:00.000Z"
```

### Daily Limit Reset Example

```typescript
import { useCountdown, getNextDayStartTime } from '@umituz/react-native-countdown';

const DailyLimitComponent = () => {
  const nextReset = getNextDayStartTime();
  const { formatted } = useCountdown(nextReset, {
    t: (key) => translations[key],
  });

  return (
    <View>
      <Text>Next reset in: {formatted}</Text>
    </View>
  );
};
```

## API

### Hooks

#### `useCountdown(targetDate, options?)`

React hook for real-time countdown updates.

**Parameters:**
- `targetDate`: ISO date string, Date object, or null/undefined
- `options`: Optional configuration
  - `interval`: Update interval in milliseconds (default: 1000)
  - `autoStart`: Whether to start automatically (default: true)
  - `onExpire`: Callback when countdown expires
  - `showSecondsThreshold`: Show seconds when less than this many minutes (default: 5)
  - `separator`: Separator between time units (default: " ")
  - `t`: Translation function for i18n
  - `keys`: Translation keys mapping

**Returns:**
- `timeRemaining`: TimeRemaining object with hours, minutes, seconds, etc.
- `formatted`: Human-readable formatted string
- `short`: Short formatted string (e.g., "2h 30m")
- `compact`: Compact formatted string (e.g., "2:30:00")
- `isActive`: Whether countdown is active
- `start()`: Start the countdown
- `stop()`: Stop the countdown
- `reset(newTargetDate)`: Reset with new target date

### Utilities

#### `calculateTimeRemaining(targetDate)`

Calculate time remaining until target date.

**Returns:** `TimeRemaining` object with hours, minutes, seconds, totalSeconds, and isExpired.

#### `formatCountdown(targetDate, options?)`

Format countdown as human-readable string with optional i18n support.

#### `formatCountdownShort(targetDate, options?)`

Format countdown as short string (e.g., "2h 30m").

#### `formatCountdownCompact(targetDate, options?)`

Format countdown as compact string (e.g., "2:30:00").

#### `getNextDayStartTime(date?)`

Get next day start time (midnight of next day) in device timezone. Useful for daily limit resets.

**Timezone-aware**: Returns midnight of next day in the device's local timezone, ensuring accurate daily limit calculations regardless of user location.

#### `getNextHourStartTime(date?)`

Get next hour start time in device timezone. Useful for hourly limit resets.

**Timezone-aware**: Returns start of next hour in the device's local timezone.

## License

MIT


import { useState, useEffect } from 'react';
import { HOUR_MS, MINUTE_MS, SECOND_MS, startOfDay, add } from '../utils';

const getIntervalDelay = (diff: number) => {
  if (diff > 12 * HOUR_MS) {
    return 6 * HOUR_MS;
  } else if (diff > HOUR_MS) {
    return 30 * MINUTE_MS;
  } else if (diff > MINUTE_MS) {
    return 30 * SECOND_MS;
  }
  return 1000;
};

/**
 * Returns the start of the current day and updates it after midnight.
 * The value is stable for the whole day, so context consumers do not
 * re-render on every timer tick (unlike `setToday(new Date())`).
 */
export const useToday = () => {
  const [today, setToday] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const now = new Date();
      const startOfTomorrow = startOfDay(add(now, 1, 'day'));
      const diff = startOfTomorrow.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        const next = startOfDay(new Date());

        setToday((previous) =>
          previous.getTime() === next.getTime() ? previous : next
        );

        schedule();
      }, getIntervalDelay(diff));
    };

    schedule();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return today;
};

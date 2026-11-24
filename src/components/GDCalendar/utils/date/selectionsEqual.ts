import type { TRangeSelection } from '../../types';
import { datesSame } from '../utils';

/**
 * Compares two selections by value (day precision, which is what
 * `normalizeSelection` guarantees) instead of by reference.
 *
 * Used to decide whether a new `selection` prop really changed, so inline
 * array/Date props (`selection={[a, b]}`) do not force a state update and an
 * extra render on every parent render.
 */
export const selectionsEqual = (
  a?: Date | TRangeSelection | null,
  b?: Date | TRangeSelection | null
): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && datesSame(a, b, 'date');
  }

  const [aStart, aEnd] = a;
  const [bStart, bEnd] = b;

  const sameStart =
    aStart == null
      ? bStart == null
      : bStart != null && datesSame(aStart, bStart, 'date');
  const sameEnd =
    aEnd == null
      ? bEnd == null
      : bEnd != null && datesSame(aEnd, bEnd, 'date');

  return sameStart && sameEnd;
};

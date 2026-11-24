import { describe, expect, it } from 'vitest';
import { selectionsEqual } from './selectionsEqual';
import type { TRangeSelection } from '../../types';

const date = (y: number, m: number, d: number) => new Date(y, m, d);

describe('selectionsEqual', () => {
  it('returns true for the same reference', () => {
    const range: TRangeSelection = [date(2026, 2, 10), null];

    expect(selectionsEqual(range, range)).toBe(true);
  });

  it('returns true for different instances of the same days', () => {
    const a: TRangeSelection = [date(2026, 2, 10), date(2026, 2, 12)];
    const b: TRangeSelection = [date(2026, 2, 10), date(2026, 2, 12)];

    expect(selectionsEqual(a, b)).toBe(true);
  });

  it('compares by day, not by time of day', () => {
    expect(
      selectionsEqual(
        date(2026, 2, 10),
        new Date(2026, 2, 10, 23, 59, 59, 999)
      )
    ).toBe(true);
  });

  it('returns false when the range edges differ', () => {
    const a: TRangeSelection = [date(2026, 2, 10), date(2026, 2, 12)];
    const b: TRangeSelection = [date(2026, 2, 10), date(2026, 2, 13)];

    expect(selectionsEqual(a, b)).toBe(false);
  });

  it('returns false when only one edge is set on the other side', () => {
    expect(selectionsEqual([date(2026, 2, 10), null], null)).toBe(false);
    expect(
      selectionsEqual(
        [date(2026, 2, 10), null],
        [date(2026, 2, 10), date(2026, 2, 11)]
      )
    ).toBe(false);
  });

  it('returns false when a range is compared with a single date', () => {
    expect(
      selectionsEqual([date(2026, 2, 10), null], date(2026, 2, 10))
    ).toBe(false);
  });

  it('handles null and undefined consistently', () => {
    expect(selectionsEqual(null, null)).toBe(true);
    expect(selectionsEqual(undefined, undefined)).toBe(true);
    expect(selectionsEqual(null, undefined)).toBe(true);
    expect(selectionsEqual(null, date(2026, 2, 10))).toBe(false);
  });
});

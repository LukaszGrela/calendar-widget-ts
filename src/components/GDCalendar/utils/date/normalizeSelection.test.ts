import { describe, expect, it } from 'vitest';
import { normalizeSelection } from './normalizeSelection';
import type { TRangeSelection } from '../../types';

const at = (day: number, hours = 15, minutes = 30) =>
  new Date(2026, 2, day, hours, minutes, 45, 250);

describe('normalizeSelection', () => {
  it('passes undefined and null through', () => {
    expect(normalizeSelection(undefined)).toBeUndefined();
    expect(normalizeSelection(null)).toBeNull();
  });

  it('moves a single date to the start of the day', () => {
    const result = normalizeSelection(at(10)) as Date;

    expect(result).toBeInstanceOf(Date);
    expect([
      result.getHours(),
      result.getMinutes(),
      result.getSeconds(),
      result.getMilliseconds(),
    ]).toEqual([0, 0, 0, 0]);
    expect(result.getDate()).toBe(10);
  });

  it('does not mutate the given date', () => {
    const source = at(10);

    normalizeSelection(source);

    expect(source.getHours()).toBe(15);
    expect(source.getMilliseconds()).toBe(250);
  });

  it('normalizes both range ends', () => {
    const result = normalizeSelection([at(10), at(14)]) as TRangeSelection;

    expect(result.map((date) => date?.getDate())).toEqual([10, 14]);
    result.forEach((date) => {
      expect(date?.getHours()).toBe(0);
      expect(date?.getMilliseconds()).toBe(0);
    });
  });

  it('turns [null, Date] into [Date, null]', () => {
    const result = normalizeSelection([null, at(10)]) as TRangeSelection;

    expect([result[0]?.getDate(), result[1]]).toEqual([10, null]);
    expect(result[0]?.getHours()).toBe(0);
  });

  it('keeps an open range and an empty range', () => {
    const open = normalizeSelection([at(10), null]) as TRangeSelection;
    expect([open[0]?.getDate(), open[1]]).toEqual([10, null]);

    const empty = normalizeSelection([null, null]) as TRangeSelection;
    expect(empty).toEqual([null, null]);
  });

  it('does not mutate the given range', () => {
    const second = at(10);
    const source: TRangeSelection = [null, second];

    normalizeSelection(source);

    expect(source[0]).toBeNull();
    expect(source[1]).toBe(second);
  });
});

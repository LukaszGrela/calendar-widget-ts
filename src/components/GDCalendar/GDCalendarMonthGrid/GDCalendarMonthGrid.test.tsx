import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { TDateData } from '../types';
import GDCalendarMonthGrid from './GDCalendarMonthGrid';

const captured = vi.hoisted(() => ({ nows: [] as (Date | undefined)[] }));

vi.mock('../GDCalendarRow', () => ({
  GDCalendarRow: (props: { now?: Date }) => {
    captured.nows.push(props.now);
    return null;
  },
}));

const day = (month: number, date: number): TDateData => ({
  date: new Date(2026, month, date, 0, 0, 0, 0),
  holiday: false,
  spill: false,
  weekend: false,
});

const week = (): TDateData[] => [
  day(2, 1),
  day(2, 2),
  day(2, 3),
  day(2, 4),
  day(2, 5),
  day(2, 6),
  day(2, 7),
];

describe('GDCalendarMonthGrid', () => {
  it('keeps one stable `now` between renders when the prop is omitted', () => {
    captured.nows = [];

    const { rerender } = render(<GDCalendarMonthGrid weeks={[week()]} />);
    rerender(<GDCalendarMonthGrid weeks={[week()]} />);
    rerender(<GDCalendarMonthGrid weeks={[week()]} />);

    expect(captured.nows).toHaveLength(3);
    const first = captured.nows[0];
    expect(first).toBeInstanceOf(Date);
    expect(captured.nows.every((now) => now === first)).toBe(true);
  });

  it('passes an explicit `now` through unchanged', () => {
    captured.nows = [];
    const now = new Date(2026, 2, 9);

    const { rerender } = render(
      <GDCalendarMonthGrid weeks={[week()]} now={now} />
    );
    rerender(<GDCalendarMonthGrid weeks={[week()]} now={now} />);

    expect(captured.nows).toHaveLength(2);
    expect(captured.nows.every((value) => value === now)).toBe(true);
  });
});

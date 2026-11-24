import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import GDCalendarRow from './GDCalendarRow';
import { GDCalendarContext } from '../context/GDCalendarContext';
import type { TCalendarContext } from '../context/types';
import type { TDateData } from '../types';

const buildContext = (): TCalendarContext => ({
  today: new Date(2026, 2, 1),
  weekdays: ['Mon'],
  monthList: ['Mar'],
  direction: 'none',
  currentMonth: new Date(2026, 2, 15),
  yearSpan: 100,
  yearList: [2026],
  weeks: [],
  locale: 'en-US',
});

const day = (date: Date): TDateData => ({ date });

const renderRow = (props: {
  days: TDateData[];
  selection?: Date | [Date | null, Date | null] | null;
}) => {
  const { container } = render(
    <GDCalendarContext.Provider value={buildContext()}>
      <GDCalendarRow {...props} onClick={() => {}} />
    </GDCalendarContext.Provider>
  );

  // compare single classes, not substrings: "GDCalendar" itself contains "end"
  return Array.from(container.querySelectorAll('.GDCalendar_Day')).map((cell) =>
    cell.className.split(' ')
  );
};

describe('GDCalendarRow', () => {
  it('keeps the days of the week in order', () => {
    const classes = renderRow({
      days: [day(new Date(2026, 2, 2)), day(new Date(2026, 2, 3))],
    });

    expect(classes).toHaveLength(2);
  });

  it('marks the range edges when the selection carries a time', () => {
    const classes = renderRow({
      days: [
        day(new Date(2026, 2, 2)),
        day(new Date(2026, 2, 3)),
        day(new Date(2026, 2, 4)),
      ],
      selection: [new Date(2026, 2, 2, 15, 30), new Date(2026, 2, 4, 8, 5)],
    });

    expect(classes[0]).toContain('start');
    expect(classes[0]).not.toContain('end');
    expect(classes[1]).not.toContain('start');
    expect(classes[1]).not.toContain('end');
    expect(classes[2]).toContain('end');
    expect(classes[2]).not.toContain('start');
  });

  it('marks the single selected day regardless of the time of day', () => {
    const classes = renderRow({
      days: [day(new Date(2026, 2, 2)), day(new Date(2026, 2, 3))],
      selection: new Date(2026, 2, 2, 23, 59),
    });

    expect(classes[0]).toContain('selected');
    expect(classes[1]).not.toContain('selected');
  });
});

import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { GDCalendarProvider } from './GDCalendarProvider';
import { useGDCalendarActionsContext } from './GDCalendarContext';
import type { TCalendarActionsContext } from './types';

const ymd = (date: Date) =>
  [date.getFullYear(), date.getMonth(), date.getDate()] as const;

const setup = (date: Date) => {
  const calls: Date[] = [];
  const actions: TCalendarActionsContext[] = [];

  const ActionsProbe = () => {
    const context = useGDCalendarActionsContext();
    if (context) actions.push(context);
    return null;
  };

  render(
    <GDCalendarProvider date={date} onDateChanged={(next) => calls.push(next)}>
      <ActionsProbe />
    </GDCalendarProvider>
  );

  const run = (action: (context: TCalendarActionsContext) => void) => {
    act(() => action(actions[actions.length - 1]));
  };

  const last = () => calls[calls.length - 1];

  return { calls, run, last };
};

describe('GDCalendarProvider navigation', () => {
  it('clamps 31 January to the last day of February', () => {
    const { run, last } = setup(new Date(2026, 0, 31, 10, 30));

    run((context) => context.setMonth(1));

    expect(ymd(last())).toEqual([2026, 1, 28]);
    // the time of day is kept, only the day of month is clamped
    expect([last().getHours(), last().getMinutes()]).toEqual([10, 30]);
  });

  it('clamps 29 February to 28 February in a non leap year', () => {
    const { run, last } = setup(new Date(2024, 1, 29));

    run((context) => context.setYear(2025));

    expect(ymd(last())).toEqual([2025, 1, 28]);
  });

  it('keeps the day when the target month is long enough', () => {
    const { run, last } = setup(new Date(2026, 0, 15));

    run((context) => context.setMonth(1));

    expect(ymd(last())).toEqual([2026, 1, 15]);
  });

  it('clamps 31 March when moving to the next month', () => {
    const { run, last } = setup(new Date(2026, 2, 31));

    run((context) => context.nextMonth());

    expect(ymd(last())).toEqual([2026, 3, 30]);
  });

  it('clamps 31 March when moving to the previous month', () => {
    const { run, last } = setup(new Date(2026, 2, 31));

    run((context) => context.prevMonth());

    expect(ymd(last())).toEqual([2026, 1, 28]);
  });

  it('keeps 31 December when only the year changes', () => {
    const { run, last } = setup(new Date(2026, 11, 31));

    run((context) => context.setYear(2027));

    expect(ymd(last())).toEqual([2027, 11, 31]);
  });

  it('clamps 29 February when moving to the next year', () => {
    const { run, last } = setup(new Date(2024, 1, 29));

    run((context) => context.nextYear());

    expect(ymd(last())).toEqual([2025, 1, 28]);
  });

  it('moves 31 December to January of the next year', () => {
    const { run, last } = setup(new Date(2026, 11, 31));

    run((context) => context.nextMonth());

    expect(ymd(last())).toEqual([2027, 0, 31]);
  });

  it('moves January back to December of the previous year', () => {
    const { run, last } = setup(new Date(2027, 0, 15));

    run((context) => context.prevMonth());

    expect(ymd(last())).toEqual([2026, 11, 15]);
  });
});

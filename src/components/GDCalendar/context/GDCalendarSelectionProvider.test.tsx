import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { GDCalendarSelectionProvider } from './GDCalendarSelectionProvider';
import {
  useGDCalendarSelectionActionContext,
  useGDCalendarSelectionContext,
} from './GDCalendarSelectionContext';
import type { TCalendarSelectionActionContext } from './types';
import type { TRangeSelection } from '../types';

const day = (d: number) => new Date(2026, 2, d);
const at = (value: Date | TRangeSelection | null | undefined) =>
  value instanceof Date
    ? value.getTime()
    : value
      ? value.map((date) => (date ? date.getTime() : null))
      : value;

type TProbeProps = {
  onRender: (selection: Date | TRangeSelection | null | undefined) => void;
};

const Probe = ({ onRender }: TProbeProps) => {
  const context = useGDCalendarSelectionContext();
  onRender(context?.selection);
  return null;
};

type TActionProbeProps = {
  onRender: (action: TCalendarSelectionActionContext['selectDate']) => void;
};

const ActionProbe = ({ onRender }: TActionProbeProps) => {
  const context = useGDCalendarSelectionActionContext();
  if (context) onRender(context.selectDate);
  return null;
};

describe('GDCalendarSelectionProvider', () => {
  it('keeps the committed value stable across re-renders', () => {
    const seen: (Date | TRangeSelection | null | undefined)[] = [];
    const onDateSelected = vi.fn();
    const onRender = (selection: Date | TRangeSelection | null | undefined) =>
      seen.push(selection);
    const selection: TRangeSelection = [day(10), day(12)];

    const { rerender } = render(
      <GDCalendarSelectionProvider
        selection={selection}
        onDateSelected={onDateSelected}
      >
        <Probe onRender={onRender} />
      </GDCalendarSelectionProvider>
    );
    const first = seen[seen.length - 1];

    // unchanged prop instance: the context value keeps its identity, so
    // consumers are not invalidated by an equivalent object
    rerender(
      <GDCalendarSelectionProvider
        selection={selection}
        onDateSelected={onDateSelected}
      >
        <Probe onRender={onRender} />
      </GDCalendarSelectionProvider>
    );
    expect(at(seen[seen.length - 1])).toEqual(at(first));
    expect(seen[seen.length - 1]).toBe(first);

    // an inline, value-equal prop is a new object, but the rendered value is
    // still the same and no state write or callback is triggered by it
    rerender(
      <GDCalendarSelectionProvider
        selection={[day(10), day(12)]}
        onDateSelected={onDateSelected}
      >
        <Probe onRender={onRender} />
      </GDCalendarSelectionProvider>
    );
    expect(at(seen[seen.length - 1])).toEqual(at(first));
    expect(onDateSelected).not.toHaveBeenCalled();
  });

  it('updates the context when the selection prop really changes', () => {
    const seen: (Date | TRangeSelection | null | undefined)[] = [];
    const onRender = (selection: Date | TRangeSelection | null | undefined) =>
      seen.push(selection);

    const { rerender } = render(
      <GDCalendarSelectionProvider selection={[day(10), day(12)]}>
        <Probe onRender={onRender} />
      </GDCalendarSelectionProvider>
    );
    const first = seen[seen.length - 1];

    rerender(
      <GDCalendarSelectionProvider selection={[day(10), day(14)]}>
        <Probe onRender={onRender} />
      </GDCalendarSelectionProvider>
    );

    expect(seen[seen.length - 1]).not.toBe(first);
    expect(at(seen[seen.length - 1])).toEqual([
      day(10).getTime(),
      day(14).getTime(),
    ]);
  });

  it('normalizes a single date prop to the start of the day', () => {
    const seen: (Date | TRangeSelection | null | undefined)[] = [];

    render(
      <GDCalendarSelectionProvider selection={new Date(2026, 2, 10, 15, 30)}>
        <Probe onRender={(selection) => seen.push(selection)} />
      </GDCalendarSelectionProvider>
    );

    const selection = seen[seen.length - 1];
    expect(selection).toBeInstanceOf(Date);
    expect((selection as Date).getHours()).toBe(0);
    expect((selection as Date).getDate()).toBe(10);
  });

  it('keeps the uncontrolled selection in internal state', () => {
    const seen: (Date | TRangeSelection | null | undefined)[] = [];
    const actions: TCalendarSelectionActionContext['selectDate'][] = [];
    const onDateSelected = vi.fn();

    render(
      <GDCalendarSelectionProvider onDateSelected={onDateSelected}>
        <Probe onRender={(selection) => seen.push(selection)} />
        <ActionProbe onRender={(selectDate) => actions.push(selectDate)} />
      </GDCalendarSelectionProvider>
    );
    const selectDate = actions[actions.length - 1];

    // nothing is selected until the calendar is used
    expect(seen[seen.length - 1]).toBeUndefined();

    // an uncontrolled provider has no range source, so the internal state
    // mirrors exactly what is emitted to `onDateSelected`
    act(() => selectDate({ date: day(10) }));
    expect(at(seen[seen.length - 1])).toBe(day(10).getTime());

    act(() => selectDate({ date: day(12) }));
    expect(at(seen[seen.length - 1])).toBe(day(12).getTime());

    act(() => selectDate());
    expect(seen[seen.length - 1]).toBeUndefined();

    expect(onDateSelected).toHaveBeenCalledTimes(3);
    expect(at(onDateSelected.mock.calls[1][0])).toBe(day(12).getTime());
    expect(onDateSelected.mock.calls[2][0]).toBeUndefined();
  });

  it('does not mutate controlled selection from the inside', () => {
    const seen: (Date | TRangeSelection | null | undefined)[] = [];
    const actions: TCalendarSelectionActionContext['selectDate'][] = [];
    const onDateSelected = vi.fn();

    render(
      <GDCalendarSelectionProvider
        selection={[day(10), null]}
        onDateSelected={onDateSelected}
      >
        <Probe onRender={(selection) => seen.push(selection)} />
        <ActionProbe onRender={(selectDate) => actions.push(selectDate)} />
      </GDCalendarSelectionProvider>
    );
    const selectDate = actions[actions.length - 1];

    act(() => selectDate({ date: day(12) }));

    expect(onDateSelected).toHaveBeenCalledTimes(1);
    expect(at(onDateSelected.mock.calls[0][0])).toEqual([
      day(10).getTime(),
      day(12).getTime(),
    ]);
    // the prop still wins: the calendar keeps rendering what the parent sent
    expect(at(seen[seen.length - 1])).toEqual([day(10).getTime(), null]);
  });

  it('does not resurrect the last controlled selection when the prop is removed', () => {
    const seen: (Date | TRangeSelection | null | undefined)[] = [];
    const onRender = (selection: Date | TRangeSelection | null | undefined) =>
      seen.push(selection);

    const { rerender } = render(
      <GDCalendarSelectionProvider selection={day(10)}>
        <Probe onRender={onRender} />
      </GDCalendarSelectionProvider>
    );

    rerender(
      <GDCalendarSelectionProvider>
        <Probe onRender={onRender} />
      </GDCalendarSelectionProvider>
    );

    expect(seen[seen.length - 1]).toBeUndefined();
  });
});

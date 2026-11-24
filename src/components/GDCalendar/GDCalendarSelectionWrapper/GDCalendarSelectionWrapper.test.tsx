import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { GDCalendarSelectionWrapper } from './GDCalendarSelectionWrapper';
import {
  GDCalendarActionsContext,
  GDCalendarContext,
} from '../context/GDCalendarContext';
import { useGDCalendarSelectionActionContext } from '../context/GDCalendarSelectionContext';
import type {
  TCalendarActionsContext,
  TCalendarContext,
  TCalendarSelectionActionContext,
} from '../context/types';
import type { TRangeSelection } from '../types';

const day = (d: number) => new Date(2026, 2, d);
// a "spill" day: rendered in the March grid, but belongs to February
const spill = new Date(2026, 1, 26);

const buildCalendarContext = (isControlled: boolean): TCalendarContext => ({
  today: day(1),
  weekdays: ['Mon'],
  monthList: ['Mar'],
  direction: 'none',
  currentMonth: day(15),
  yearSpan: 100,
  yearList: [2026],
  weeks: [],
  isControlled,
});

const ActionProbe = ({
  onRender,
}: {
  onRender: (action: TCalendarSelectionActionContext['selectDate']) => void;
}) => {
  const context = useGDCalendarSelectionActionContext();
  if (context) onRender(context.selectDate);
  return null;
};

type TRenderOptions = {
  isControlled: boolean;
  navigateOnSelect?: boolean;
  selection?: Date | TRangeSelection | null;
};

const setup = ({
  isControlled,
  navigateOnSelect,
  selection,
}: TRenderOptions) => {
  const onDateSelected = vi.fn();
  const onDateChanged = vi.fn();
  const setDisplayedMonth = vi.fn();
  const captured: {
    selectDate?: TCalendarSelectionActionContext['selectDate'];
  } = {};

  render(
    <GDCalendarContext.Provider value={buildCalendarContext(isControlled)}>
      <GDCalendarActionsContext.Provider
        value={{ setDisplayedMonth } as unknown as TCalendarActionsContext}
      >
        <GDCalendarSelectionWrapper
          selection={selection}
          onDateSelected={onDateSelected}
          onDateChanged={onDateChanged}
          navigateOnSelect={navigateOnSelect}
        >
          <ActionProbe
            onRender={(action) => {
              captured.selectDate = action;
            }}
          />
        </GDCalendarSelectionWrapper>
      </GDCalendarActionsContext.Provider>
    </GDCalendarContext.Provider>
  );

  const select = (date: Date | undefined) => {
    act(() => captured.selectDate?.(date ? { date } : undefined));
  };

  return { onDateSelected, onDateChanged, setDisplayedMonth, select };
};

describe('GDCalendarSelectionWrapper', () => {
  it('navigates to the spill day month in uncontrolled mode', () => {
    const { onDateSelected, onDateChanged, setDisplayedMonth, select } = setup(
      { isControlled: false }
    );

    select(spill);

    expect(setDisplayedMonth).toHaveBeenCalledTimes(1);
    expect(setDisplayedMonth).toHaveBeenCalledWith(spill);
    expect(onDateChanged).not.toHaveBeenCalled();
    expect(onDateSelected).toHaveBeenCalledWith(spill);
  });

  it('does not navigate in uncontrolled mode when navigateOnSelect is false', () => {
    const { onDateSelected, setDisplayedMonth, select } = setup({
      isControlled: false,
      navigateOnSelect: false,
    });

    select(spill);

    expect(setDisplayedMonth).not.toHaveBeenCalled();
    expect(onDateSelected).toHaveBeenCalledWith(spill);
  });

  it('only requests the month change in controlled mode', () => {
    const { onDateSelected, onDateChanged, setDisplayedMonth, select } = setup(
      { isControlled: true, selection: day(15) }
    );

    select(spill);

    expect(setDisplayedMonth).not.toHaveBeenCalled();
    expect(onDateChanged).toHaveBeenCalledWith(spill);
    expect(onDateSelected).toHaveBeenCalledWith(spill);
  });

  it('keeps a spill day a pure selection in controlled mode when navigateOnSelect is false', () => {
    const { onDateSelected, onDateChanged, setDisplayedMonth, select } = setup(
      { isControlled: true, navigateOnSelect: false, selection: day(15) }
    );

    select(spill);

    expect(setDisplayedMonth).not.toHaveBeenCalled();
    expect(onDateChanged).not.toHaveBeenCalled();
    expect(onDateSelected).toHaveBeenCalledWith(spill);
  });

  it('does not navigate when the selected day belongs to the displayed month', () => {
    const { onDateSelected, onDateChanged, setDisplayedMonth, select } = setup(
      { isControlled: false }
    );

    select(day(15));

    expect(setDisplayedMonth).not.toHaveBeenCalled();
    expect(onDateChanged).not.toHaveBeenCalled();
    expect(onDateSelected).toHaveBeenCalledWith(day(15));
  });

  it('does not navigate when the selection is cleared', () => {
    const { onDateSelected, onDateChanged, setDisplayedMonth, select } = setup(
      { isControlled: true, selection: day(15) }
    );

    select(undefined);

    expect(setDisplayedMonth).not.toHaveBeenCalled();
    expect(onDateChanged).not.toHaveBeenCalled();
    expect(onDateSelected).toHaveBeenCalledWith(undefined);
  });
});

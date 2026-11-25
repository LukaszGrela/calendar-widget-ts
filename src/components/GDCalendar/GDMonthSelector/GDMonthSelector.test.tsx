import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GDMonthSelector } from './GDMonthSelector';
import {
  GDCalendarActionsContext,
  GDCalendarContext,
} from '../context/GDCalendarContext';
import type {
  TCalendarActionsContext,
  TCalendarContext,
} from '../context/types';

const buildCalendarContext = (): TCalendarContext => ({
  today: new Date(2026, 2, 1),
  weekdays: ['Mon'],
  monthList: ['January', 'February', 'March'],
  direction: 'none',
  currentMonth: new Date(2026, 2, 15),
  yearSpan: 100,
  yearList: [2026],
  weeks: [],
  locale: 'en-US',
});

const setup = () => {
  const setMonth = vi.fn();
  const actions: TCalendarActionsContext = {
    prevMonth: vi.fn(),
    nextMonth: vi.fn(),
    prevYear: vi.fn(),
    nextYear: vi.fn(),
    setYear: vi.fn(),
    setMonth,
    setToday: vi.fn(),
    setDisplayedMonth: vi.fn(),
  };

  render(
    <GDCalendarContext.Provider value={buildCalendarContext()}>
      <GDCalendarActionsContext.Provider value={actions}>
        <GDMonthSelector />
      </GDCalendarActionsContext.Provider>
    </GDCalendarContext.Provider>
  );

  return {
    setMonth,
    select: screen.getByRole('combobox', {
      name: 'Month',
    }) as HTMLSelectElement,
  };
};

describe('GDMonthSelector', () => {
  it('has an accessible name', () => {
    const { select } = setup();

    expect(select.getAttribute('aria-label')).toBe('Month');
    expect(select.value).toBe('2');
  });

  it('changes the month when a keyboard user picks an option', async () => {
    const user = userEvent.setup();
    const { setMonth, select } = setup();

    await user.tab();
    expect(document.activeElement).toBe(select);

    await user.selectOptions(select, '0');
    expect(setMonth).toHaveBeenCalledWith(0);
  });
});

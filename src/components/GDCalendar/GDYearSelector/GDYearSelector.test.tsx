import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GDYearSelector } from './GDYearSelector';
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
  yearList: [2025, 2026, 2027],
  weeks: [],
  locale: 'en-US',
});

const setup = () => {
  const setYear = vi.fn();
  const actions: TCalendarActionsContext = {
    prevMonth: vi.fn(),
    nextMonth: vi.fn(),
    prevYear: vi.fn(),
    nextYear: vi.fn(),
    setYear,
    setMonth: vi.fn(),
    setToday: vi.fn(),
    setDisplayedMonth: vi.fn(),
  };

  render(
    <GDCalendarContext.Provider value={buildCalendarContext()}>
      <GDCalendarActionsContext.Provider value={actions}>
        <GDYearSelector />
      </GDCalendarActionsContext.Provider>
    </GDCalendarContext.Provider>
  );

  return {
    setYear,
    select: screen.getByRole('combobox', {
      name: 'Year',
    }) as HTMLSelectElement,
  };
};

describe('GDYearSelector', () => {
  it('has an accessible name', () => {
    const { select } = setup();

    expect(select.getAttribute('aria-label')).toBe('Year');
    expect(select.value).toBe('2026');
  });

  it('changes the year when a keyboard user picks an option', async () => {
    const user = userEvent.setup();
    const { setYear, select } = setup();

    await user.tab();
    expect(document.activeElement).toBe(select);

    await user.selectOptions(select, '2025');
    expect(setYear).toHaveBeenCalledWith(2025);
  });
});

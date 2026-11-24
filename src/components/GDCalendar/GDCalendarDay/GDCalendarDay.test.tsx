import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GDCalendarDay from './GDCalendarDay';
import { GDCalendarContext } from '../context/GDCalendarContext';
import type { TCalendarContext } from '../context/types';
import type { TDateData } from '../types';

// Monday, 2 March 2026
const date = new Date(2026, 2, 2);
const data: TDateData = { date };

const buildContext = (locale = 'en-US'): TCalendarContext => ({
  today: new Date(2026, 2, 1),
  weekdays: ['Mon'],
  monthList: ['Mar'],
  direction: 'none',
  currentMonth: new Date(2026, 2, 15),
  yearSpan: 100,
  yearList: [2026],
  weeks: [],
  locale,
});

const fullDate = (locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date);

type TDayProps = {
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
  locale?: string;
};

const setup = ({ selected, today, disabled, locale }: TDayProps = {}) => {
  const onClick = vi.fn();
  render(
    <GDCalendarContext.Provider value={buildContext(locale)}>
      <GDCalendarDay
        data={data}
        onClick={onClick}
        selected={selected}
        today={today}
        disabled={disabled}
      />
    </GDCalendarContext.Provider>
  );

  return {
    onClick,
    button: screen.getByRole('button') as HTMLButtonElement,
  };
};

describe('GDCalendarDay', () => {
  it('renders a native button so the day is focusable', () => {
    const { button } = setup();

    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('describes the day with the full localized date', () => {
    const { button } = setup();

    expect(button.getAttribute('aria-label')).toBe(fullDate('en-US'));
  });

  it('follows the locale from the calendar context', () => {
    const { button } = setup({ locale: 'pl-PL' });

    expect(button.getAttribute('aria-label')).toBe(fullDate('pl-PL'));
  });

  it('can be focused and activated with the keyboard', async () => {
    const user = userEvent.setup();
    const { onClick, button } = setup();

    await user.tab();
    expect(document.activeElement).toBe(button);

    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(data);

    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('exposes the unselected state through aria-pressed', () => {
    const { button } = setup();

    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('exposes the selected state through aria-pressed', () => {
    const { button } = setup({ selected: true });

    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('does not mark an ordinary day with aria-current', () => {
    const { button } = setup();

    expect(button.hasAttribute('aria-current')).toBe(false);
  });

  it('marks the current day with aria-current', () => {
    const { button } = setup({ today: true });

    expect(button.getAttribute('aria-current')).toBe('date');
  });

  it('keeps a disabled day out of the tab order', async () => {
    const user = userEvent.setup();
    const { onClick, button } = setup({ disabled: true });

    expect(button.disabled).toBe(true);

    await user.tab();
    expect(document.activeElement).not.toBe(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});

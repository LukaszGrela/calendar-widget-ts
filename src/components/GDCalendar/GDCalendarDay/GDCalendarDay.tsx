import React, { useCallback, useMemo, type ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import { useGDCalendarContext } from '../context/GDCalendarContext';
import type { TDateProps } from './types';

const GDCalendarDay: React.FC<TDateProps> = ({
  className,
  onClick,
  selected,
  today,
  data,
  endSelection,
  startSelection,
  disabled,
}: TDateProps): ReactNode => {
  const { locale } = useGDCalendarContext();

  const clickHandler = useCallback(() => {
    onClick(data);
  }, [data, onClick]);

  // Screen readers get the full date, not just the day number.
  const label = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(data.date),
    [data.date, locale]
  );

  return (
    <button
      type="button"
      className={classNames(
        'GDCalendar_Day',
        'date',
        className,
        selected && 'selected',
        selected && startSelection && 'start',
        selected && endSelection && 'end',
        data.holiday && 'holiday',
        data.weekend && 'weekend',
        data.spill && 'spill',
        today && 'today'
      )}
      aria-label={label}
      aria-pressed={!!selected}
      aria-current={today ? 'date' : undefined}
      disabled={disabled}
      onClick={clickHandler}
    >
      {data.date.getDate()}
    </button>
  );
};

export default GDCalendarDay;

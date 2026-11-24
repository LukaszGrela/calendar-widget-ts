import './GDCalendarMonthGrid.scss';
import React, { useMemo, type ReactNode } from 'react';
import { noop } from '../utils';
import { GDCalendarRow } from '../GDCalendarRow';
import type { IProps } from './types';
import { classNames } from '../../../utils/classNames';

const GDCalendarMonthGrid: React.FC<IProps> = ({
  className,
  weeks = [],
  now,
  onClick = noop,
  selection,
  workingWeek = 7,
  mondayFirst = false,
}: IProps): ReactNode => {
  // `now` must keep a stable identity between renders, otherwise a future
  // `memo` on `GDCalendarRow` could never skip a re-render. Without a prop we
  // still need exactly one `Date` per render value, not one per render.
  const today = useMemo(() => now ?? new Date(), [now]);

  return (
    <div className={classNames('GDCalendar_MonthGrid', className)}>
      {weeks.map((week, index): ReactNode => {
        const key = `${week[0].date.toISOString()}`;

        return (
          <GDCalendarRow
            key={key}
            className={`row-${index}`}
            days={week}
            now={today}
            onClick={onClick}
            selection={selection}
            mondayFirst={mondayFirst}
            workingWeek={workingWeek}
          />
        );
      })}
    </div>
  );
};

export default GDCalendarMonthGrid;

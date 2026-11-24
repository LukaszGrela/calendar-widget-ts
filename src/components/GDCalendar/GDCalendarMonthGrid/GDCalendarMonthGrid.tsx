import './GDCalendarMonthGrid.scss';
import React, { type ReactNode } from 'react';
import { noop } from '../utils';
import { GDCalendarRow } from '../GDCalendarRow';
import type { IProps } from './types';
import { classNames } from '../../../utils/classNames';

const GDCalendarMonthGrid: React.FC<IProps> = ({
  className,
  weeks = [],
  now = new Date(),
  onClick = noop,
  selection,
  workingWeek = 7,
  mondayFirst = false,
}: IProps): ReactNode => {
  return (
    <div className={classNames('GDCalendar_MonthGrid', className)}>
      {weeks.map((week, index): ReactNode => {
        const key = `${week[0].date.toISOString()}`;

        return (
          <GDCalendarRow
            key={key}
            className={`row-${index}`}
            days={week}
            now={now}
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

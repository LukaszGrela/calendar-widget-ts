import { useCallback, type FC, type ReactNode } from 'react';
import type { IProps, TRangeSelection } from '../types';
import {
  useGDCalendarContext,
  useGDCalendarActionsContext,
} from '../context/GDCalendarContext';
import { GDCalendarSelectionProvider } from '../context/GDCalendarSelectionProvider';
import { datesSame } from '../utils';

export const GDCalendarSelectionWrapper: FC<
  Pick<
    IProps,
    'onDateSelected' | 'selection' | 'onDateChanged' | 'navigateOnSelect'
  > & {
    children: ReactNode;
  }
> = ({
  children,
  selection,
  onDateSelected,
  onDateChanged,
  navigateOnSelect = true,
}) => {
  const { isControlled, currentMonth } = useGDCalendarContext();
  const actions = useGDCalendarActionsContext();

  const selectionHandler = useCallback(
    (arg?: Date | TRangeSelection | null) => {
      const isSpillDay =
        arg instanceof Date && !datesSame(arg, currentMonth, 'month');

      // Navigation and selection are two separate concerns: selecting a
      // day outside the displayed month may ask for a month change, but
      // it stays a selection first.
      if (navigateOnSelect && isSpillDay) {
        if (isControlled) {
          // controlled: only request the change, the owner decides
          onDateChanged?.(arg);
        } else {
          // navigate to this dates month
          actions?.setDisplayedMonth(arg);
        }
      }

      onDateSelected?.(arg);
    },
    [
      actions,
      currentMonth,
      isControlled,
      navigateOnSelect,
      onDateChanged,
      onDateSelected,
    ]
  );

  return (
    <GDCalendarSelectionProvider
      selection={selection}
      onDateSelected={selectionHandler}
    >
      {children}
    </GDCalendarSelectionProvider>
  );
};

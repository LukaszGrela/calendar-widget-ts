import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import {
  GDCalendarSelectionActionContext,
  GDCalendarSelectionContext,
} from './GDCalendarSelectionContext';
import type { IProps, TDateData, TRangeSelection } from '../types';
import { normalizeSelection } from '../utils/date/normalizeSelection';
import { selectionsEqual } from '../utils/date/selectionsEqual';
import type {
  TCalendarSelectionActionContext,
  TCalendarSelectionContext,
} from './types';
import {
  dateEarlierThan,
  dateLaterThan,
  datesSame,
  dateWithinRange,
  startOfDay,
} from '../utils';

/**
 * Selection is derived from the `selection` prop when it is provided
 * (controlled) and kept in local state otherwise (uncontrolled), like
 * `useControlled` does. The previous implementation mirrored props into state
 * with `useEffect`, which caused a redundant state update and a second render
 * for every parent render with an inline `selection={[a, b]}` prop.
 */
export const GDCalendarSelectionProvider: FC<
  Pick<IProps, 'onDateSelected' | 'selection'> & { children: ReactNode }
> = ({ children, onDateSelected, selection: incomingSelection }) => {
  const isControlled = incomingSelection !== undefined;

  // Internal state starts empty and tracks only selections produced while
  // uncontrolled. Seeding it from the initial prop would resurrect a
  // controlled value after the parent stops passing `selection`, while the
  // previous (effect based) implementation cleared it.
  const [internalSelection, setInternalSelection] = useState<
    Date | TRangeSelection | null | undefined
  >(undefined);

  // Keep the previously committed value when the incoming one is equal by
  // value, so context consumers are not re-rendered with an equivalent object.
  const committedRef = useRef<Date | TRangeSelection | null | undefined>(
    normalizeSelection(incomingSelection)
  );
  const normalizedIncoming = isControlled
    ? normalizeSelection(incomingSelection)
    : undefined;
  const nextSelection = isControlled ? normalizedIncoming : internalSelection;
  if (!selectionsEqual(committedRef.current, nextSelection)) {
    committedRef.current = nextSelection;
  }
  const selection = committedRef.current;

  const commitSelection = useCallback(
    (value: Date | TRangeSelection | null | undefined) => {
      if (!isControlled) {
        setInternalSelection(value);
      }
      onDateSelected?.(value);
    },
    [isControlled, onDateSelected]
  );

  const selectDate = useCallback(
    (args?: TDateData | null) => {
      if (selection && !(selection instanceof Date)) {
        const copy = selection.concat() as TRangeSelection;
        const currentDate = args?.date ? startOfDay(args.date) : null;
        if (copy[0] == null) {
          // [null, null]
          copy[0] = currentDate;
        } else if (copy[1] == null) {
          // [Date, null]
          if (currentDate == null) {
            copy[0] = null;
          } else if (datesSame(currentDate, copy[0], 'date')) {
            copy[0] = null;
          } else if (dateLaterThan(currentDate, copy[0])) {
            copy[1] = currentDate;
          } else if (currentDate < copy[0]) {
            /* swap */
            copy[1] = copy[0];
            copy[0] = currentDate;
          }
        } else {
          // [Date, Date]
          if (currentDate == null) {
            copy[1] = null;
          } else if (
            // dateWithinRange(currentDate, copy) &&
            datesSame(currentDate, copy[1], 'date')
          ) {
            // reselected right edge, set to first and nullify second
            copy[0] = currentDate;
            copy[1] = null;
          } else if (datesSame(currentDate, copy[0], 'date')) {
            // reselected left edge, remove range selection
            copy[0] = null;
            copy[1] = null;
          } else if (dateEarlierThan(currentDate, copy[0])) {
            // expand selection to left
            copy[0] = currentDate;
          } else if (dateLaterThan(currentDate, copy[1])) {
            // expand selection to right
            copy[1] = currentDate;
          } else if (dateWithinRange(currentDate, copy)) {
            // narrow selection
            copy[1] = currentDate;
          }
        }
        commitSelection(copy);
      } else {
        const date = args?.date;
        if (!isControlled) {
          setInternalSelection(date ? normalizeSelection(date) : undefined);
        }
        onDateSelected?.(date);
      }
    },
    [commitSelection, isControlled, onDateSelected, selection]
  );

  const selectionContext = useMemo(
    (): TCalendarSelectionContext => ({
      selection,
    }),
    [selection]
  );
  const actionContext = useMemo(
    (): TCalendarSelectionActionContext => ({
      selectDate,
    }),
    [selectDate]
  );

  return (
    <GDCalendarSelectionActionContext.Provider value={actionContext}>
      <GDCalendarSelectionContext.Provider value={selectionContext}>
        {children}
      </GDCalendarSelectionContext.Provider>
    </GDCalendarSelectionActionContext.Provider>
  );
};

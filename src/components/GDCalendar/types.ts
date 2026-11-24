import { type IProps as IAnimatedContainerProps } from './AnimatedContainer';

export type TWorkingWeek = 7 | 6 | 5;
export interface IProps {
  // current month and day
  /**
   * Reference date of the displayed month.
   * When provided, the calendar is controlled: it does not change the
   * displayed month itself, it only asks for the change via `onDateChanged`.
   */
  date?: Date;

  /**
   * Navigation callback - reports a *requested* month change:
   * - called by `next*`/`prev*`/`set*` actions,
   * - in controlled mode also when a "spill" day outside the displayed month
   *   is selected and `navigateOnSelect` is enabled.
   * It never reports a selection - use `onDateSelected` for that.
   */
  onDateChanged?: (date: Date) => void;

  /**
   * Selected date (`Date`) or range (`[start, end]`).
   * Passing `undefined` keeps the calendar uncontrolled, `null` clears it.
   * A single selected day is a complete, one day long range - see
   * `TRangeSelection`.
   */
  selection?: Date | TRangeSelection | null;

  /**
   * Selection callback - called on every user selection, including a "spill"
   * day (a day outside the displayed month), which may additionally trigger
   * navigation first. It is independent of `onDateChanged`.
   */
  onDateSelected?: (date?: Date | TRangeSelection | null) => void;

  /**
   * Should selecting a "spill" day outside the displayed month navigate to
   * that month.
   * - uncontrolled: the calendar changes the displayed month itself,
   * - controlled: it calls `onDateChanged` and lets the owner decide.
   * Selection is always reported through `onDateSelected`, regardless of
   * this flag. By default `true` (previous behaviour).
   */
  navigateOnSelect?: boolean;

  yearSpan?: number;

  formatWeekDays?: 'long' | 'short' | 'narrow';
  formatMonthDays?: 'long' | 'short' | 'narrow';

  className?: string;

  mondayFirst?: boolean;

  locale?: Intl.LocalesArgument;

  /**
   * Should calendar change animate.
   * By default `false`.
   * It accepts config object with appear and timeout props - empty object is treated as `true`.
   */
  animate?: boolean | Pick<IAnimatedContainerProps, 'appear' | 'timeout'>;

  /**
   * Length of the week to display,
   * Mon-Sun - `7` - default
   * Mon-Sat - `6`
   * Mon-Fri - `5`
   */
  workingWeek?: TWorkingWeek;

  /**
   * Use it to customise `holiday` property setup.
   * @param date Date to test if it is a holiday
   * @returns `true` if given date should be marked as `holiday`. Return `null` for default behaviour.
   */
  holidayCallback?: (date: Date) => boolean | null;
}

export type TArrayElementType<A extends readonly unknown[] | null> =
  A extends readonly (infer ElementType)[] ? ElementType : never;

export type TDateData = {
  date: Date;

  holiday?: boolean;
  // is it a "spill" day - day outside of current month
  spill?: boolean;
  weekend?: boolean;
};

/**
 * Range selection: `[start, end]`, where both ends are optional while the user
 * is still picking.
 *
 * A single selected day is a valid, complete range: it is reported as
 * `[date, null]` and that day receives both the `start` and the `end` class, so
 * a one day range can be styled like any other range. `[null, null]` means that
 * nothing is selected.
 */
export type TRangeSelection = [start: Date | null, end: Date | null];

/**
 * Public entry point of the package.
 *
 * This is what `npm run build:lib` bundles into `dist-lib/index.js` and what
 * `dist-lib/index.d.ts` describes. The demo application (`src/main.tsx`) does
 * not use this file, it imports the components directly.
 */
export { GDCalendar } from './components/GDCalendar';
export type {
  IProps as IGDCalendarProps,
  TDateData,
  TRangeSelection,
  TWorkingWeek,
} from './components/GDCalendar';

export * from './components/GDCalendar/utils';

export { default as GDClock } from './components/GDClock/GDClock';
export type { IProps as IGDClockProps } from './components/GDClock/GDClock';

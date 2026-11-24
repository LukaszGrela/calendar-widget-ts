# Calendar Widget

React date picker and clock widgets.

- `GDCalendar` — month calendar with single date and range selection,
- `GDClock` — time picker in the shape of a watch dial (Material UI style).

[Live example - Calendar](https://clock-widget.greladesign.co/calendar) ·
[Live example - GDClock](https://clock-widget.greladesign.co/ts-clock)

The package is **not published on npm yet** (`"private": true`). See
[Library build and publishing](#library-build-and-publishing) for how to build
and pack it locally.

## Installation

```bash
npm install react react-dom
npm install /path/to/calendar-widget-hookrouter-1.1.2.tgz
```

`react` and `react-dom` are peer dependencies (`>=19.0.0 <20.0.0`) — the
widgets never bundle their own copy of React.

## GDCalendar

```TSX
import { useState, type FC, type ReactNode } from 'react';
import {
  GDCalendar,
  datesSame,
  type TRangeSelection,
} from 'calendar-widget-hookrouter';
import 'calendar-widget-hookrouter/style.css';

export const SingleDateExample: FC = (): ReactNode => {
  const [date, setDate] = useState<Date | null>(null);

  const calendarDayClicked = (
    clicked?: Date | TRangeSelection | null
  ): void => {
    if (!clicked || Array.isArray(clicked)) {
      return;
    }

    // clicking the already selected day clears the selection
    setDate((previous) => (datesSame(previous, clicked, 'date') ? null : clicked));
  };

  return (
    <section className="example">
      <p>
        <span>Selected: </span>
        <span>{date ? date.toLocaleDateString() : 'not selected'}</span>
      </p>

      <GDCalendar selection={date} onDateSelected={calendarDayClicked} />
    </section>
  );
};
```

### Range selection

`selection` accepts `Date`, `[start, end]` or `null`. A single day is a complete
one day long range: it is reported as `[date, null]` and that day gets both the
`start` and the `end` class.

```TSX
import { useState, type FC, type ReactNode } from 'react';
import {
  GDCalendar,
  type TRangeSelection,
} from 'calendar-widget-hookrouter';

export const RangeExample: FC = (): ReactNode => {
  const [range, setRange] = useState<TRangeSelection | null>(null);

  return (
    <GDCalendar
      selection={range}
      onDateSelected={(selected) => {
        if (Array.isArray(selected)) {
          setRange(selected);
        }
      }}
    />
  );
};
```

### Props

| Prop               | Type                                               | Default     | Description                                                                                                                         |
| ------------------ | -------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `date`             | `Date`                                             | `undefined` | Reference date of the displayed month. When set, the calendar is controlled: it only _requests_ navigation through `onDateChanged`. |
| `onDateChanged`    | `(date: Date) => void`                             | `undefined` | Navigation callback — a _requested_ month change, never a selection.                                                                |
| `selection`        | `Date \| TRangeSelection \| null`                  | `undefined` | Selected date or range. `undefined` keeps the calendar uncontrolled, `null` clears the selection.                                   |
| `onDateSelected`   | `(date?: Date \| TRangeSelection \| null) => void` | `undefined` | Selection callback, independent of `onDateChanged`.                                                                                 |
| `navigateOnSelect` | `boolean`                                          | `true`      | Selecting a day that spills outside the displayed month navigates to that month.                                                    |
| `yearSpan`         | `number`                                           | `100`       | How many years around the current one the year selector offers.                                                                     |
| `formatWeekDays`   | `'long' \| 'short' \| 'narrow'`                    | `'short'`   | `Intl.DateTimeFormat` weekday format.                                                                                               |
| `formatMonthDays`  | `'long' \| 'short' \| 'narrow'`                    | `'short'`   | `Intl.DateTimeFormat` day format.                                                                                                   |
| `mondayFirst`      | `boolean`                                          | `false`     | Week starts on Monday.                                                                                                              |
| `workingWeek`      | `7 \| 6 \| 5`                                      | `7`         | Length of the visible week (Mon-Sun, Mon-Sat, Mon-Fri).                                                                             |
| `locale`           | `Intl.LocalesArgument`                             | `undefined` | Locale used for all formatted names.                                                                                                |
| `animate`          | `boolean \| { appear?, timeout? }`                 | `false`     | Month change animation.                                                                                                             |
| `className`        | `string`                                           | `undefined` | Extra class on the root element.                                                                                                    |
| `holidayCallback`  | `(date: Date) => boolean \| null`                  | `undefined` | Custom `holiday` marking, see below.                                                                                                |

### `holidayCallback`

Called for every rendered day. The return value decides the `holiday` flag on
that day:

- `true` — mark the day as a holiday,
- `false` — do not mark it (this also removes the default Sunday marking),
- `null` or `undefined` — keep the default marking (Sundays are marked).

A callback that throws cannot break the calendar: the error is caught, the day
keeps the default marking and the error is logged only in development builds.

```TSX
<GDCalendar
  holidayCallback={(date) => (date.getMonth() === 11 && date.getDate() === 25)}
/>
```

### Date helpers

The package re-exports the date helpers used internally: `add`, `subtract`,
`startOfDay`, `startOfMonth`, `datesSame`, `dateEarlierThan`,
`dateWithinRange`, `calendarDates`, `weekDays`, `monthNames`, `getYearList`.

`add` and `subtract` use `amount` as an **absolute value**, so the direction is
decided by the function, not by the sign:

```TS
add(date, -1, 'month'); // still moves forward, one month ahead
subtract(date, -1, 'month'); // still moves backward, one month earlier
```

## GDClock

```TSX
import { useState, type FC, type ReactNode } from 'react';
import { GDClock, type IGDClockProps } from 'calendar-widget-hookrouter';

export const ClockExample: FC = (): ReactNode => {
  const [date, setDate] = useState(new Date());
  const [hours24, setHours24] = useState(false);
  const [snap, setSnap] = useState<IGDClockProps['snapMinutes']>(undefined);

  return (
    <section className="example">
      <p>{date.toLocaleTimeString()}</p>

      <button type="button" onClick={() => setHours24((value) => !value)}>
        {hours24 ? '12-hours' : '24-hours'}
      </button>

      <label>
        Snap minutes:
        <select
          value={snap ?? 'none'}
          onChange={(event) =>
            setSnap(
              event.target.value === 'none'
                ? undefined
                : (Number(event.target.value) as IGDClockProps['snapMinutes'])
            )
          }
        >
          {['none', '5', '10', '15', '30'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <GDClock
        date={date}
        hoursType={hours24 ? '24hours' : 'hours'}
        snapMinutes={snap}
        onDateChanged={(next) => {
          if (next) {
            setDate(next);
          }
        }}
      />
    </section>
  );
};
```

## Development

```bash
npm install
npm run dev        # demo application (vite)
npm test           # vitest, single run
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint
npm run build      # demo application build
```

## Library build and publishing

The demo application and the library are built separately, so the published
package contains only the widgets:

```bash
npm run build:lib      # dist-lib/index.js (ESM) + dist-lib/style.css
npm run build:lib:types # dist-lib/*.d.ts (declarations only)
npm run publish:dry    # npm pack + publish dry run
```

- `src/index.ts` is the public entry point — only what it exports ends up in the
  package.
- `vite.lib.config.ts` builds the ESM bundle, `tsconfig.lib.json` emits the
  declarations into the same `dist-lib` directory.
- `react`, `react-dom` and `react-transition-group` are external in the bundle
  and declared as peer/dev dependencies.
- `"private": true` is intentional while the package is not published. Remove
  it (and add `publishConfig` if you publish under a scope) before the first
  `npm publish`; `prepublishOnly` runs `build:lib` for you.

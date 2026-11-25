import { describe, expect, it, vi } from 'vitest';
import {
  add,
  calendarDates,
  datesSame,
  monthNames,
  setMonthSafe,
  setYearSafe,
  subtract,
  weekDays,
} from '../utils';

const flattenDates = (
  holidayCallback?: (date: Date) => boolean | null
): { holiday?: boolean; isSunday: boolean }[] =>
  calendarDates(new Date(2026, 2, 1), false, 7, holidayCallback)
    .flat()
    .map((data) => ({
      holiday: data.holiday,
      isSunday: data.date.getDay() === 0,
    }));

describe('utils', () => {
  describe('weekDays', () => {
    it('returns English short week day names for en-US', () => {
      expect(weekDays('short', 'en-US')).toEqual([
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
      ]);
    });
    it('returns Polish short week day names for PL, starting with monday', () => {
      expect(weekDays('short', 'pl', true)).toEqual([
        'pon.',
        'wt.',
        'śr.',
        'czw.',
        'pt.',
        'sob.',
        'niedz.',
      ]);
    });
  });
  describe('monthNames', () => {
    it('returns 12 localized month names for long format by default', () => {
      const months = monthNames('long');

      expect(months).toHaveLength(12);
      expect(
        months.every((month) => typeof month === 'string' && month.length > 0)
      ).toBe(true);
    });

    it('returns English short month names for en-US', () => {
      expect(monthNames('short', 'en-US')).toEqual([
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]);
    });

    it('returns French long month names for fr-FR', () => {
      expect(monthNames('long', 'fr-FR')).toEqual([
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ]);
    });

    it('returns narrow month names in the expected order for en-US', () => {
      expect(monthNames('narrow', 'en-US')).toEqual([
        'J',
        'F',
        'M',
        'A',
        'M',
        'J',
        'J',
        'A',
        'S',
        'O',
        'N',
        'D',
      ]);
    });
  });

  describe('calendarDates', () => {
    it('returns month matrix of 6 weeks by 7 days', () => {
      expect(calendarDates(new Date()).flatMap((date) => date)).toHaveLength(
        6 * 7
      );
    });
    it('marks weekend correctly', () => {
      const monthData = calendarDates(new Date());
      expect(monthData.at(0)?.at(0)?.weekend).toBeTruthy();
      expect(monthData.at(0)?.at(6)?.weekend).toBeTruthy();

      // week starts at corract day
      const monthData2 = calendarDates(new Date(), true);
      expect(monthData2.at(0)?.at(5)?.weekend).toBeTruthy();
      expect(monthData2.at(0)?.at(6)?.weekend).toBeTruthy();
    });
    it('marks spill correctly', () => {
      const monthData = calendarDates(new Date());
      expect(monthData.at(0)?.at(0)?.spill).toBeTruthy();
      expect(monthData.at(1)?.at(6)?.spill).toBeFalsy();
      expect(monthData.at(5)?.at(6)?.spill).toBeTruthy();

      // week starts at corract day
      const monthData2 = calendarDates(new Date(), true);
      expect(monthData2.at(0)?.at(0)?.spill).toBeTruthy();
      expect(monthData2.at(1)?.at(6)?.spill).toBeFalsy();
      expect(monthData2.at(5)?.at(6)?.spill).toBeTruthy();
    });
    it('previous month is available in the first row', () => {
      // 0 day of the week
      const weekReferenceDateSunday = new Date(
        Date.UTC(2020, 10, 1, 0, 0, 0, 0)
      );

      const monthData = calendarDates(weekReferenceDateSunday);

      // previous month
      expect(monthData.at(0)?.at(0)?.date.getMonth()).toEqual(
        weekReferenceDateSunday.getMonth() - 1
      );
      // current month
      expect(monthData.at(1)?.at(0)?.date.getMonth()).toEqual(
        weekReferenceDateSunday.getMonth()
      );
      // next month
      expect(monthData.at(5)?.at(6)?.date.getMonth()).toEqual(
        weekReferenceDateSunday.getMonth() + 1
      );

      const weekReferenceDateMonday = new Date(
        Date.UTC(2025, 11, 1, 0, 0, 0, 0)
      );
      const monthData2 = calendarDates(weekReferenceDateMonday, true);
      // previous month
      expect(monthData2.at(0)?.at(0)?.date.getMonth()).toEqual(
        weekReferenceDateMonday.getMonth() - 1
      );
      // current month
      expect(monthData2.at(1)?.at(0)?.date.getMonth()).toEqual(
        weekReferenceDateMonday.getMonth()
      );
      // next month
      expect(monthData2.at(5)?.at(6)?.date.getMonth()).toEqual(0);
    });

    it('supports 6-day working week with mondayFirst', () => {
      const weekReferenceDate = new Date(Date.UTC(2020, 8, 1, 0, 0, 0, 0));
      const monthData = calendarDates(weekReferenceDate, true, 6);

      expect(monthData).toHaveLength(6);
      expect(monthData.flatMap((week) => week)).toHaveLength(42);
      expect(monthData[0]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[1]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[2]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth()
      );
      expect(monthData[5]?.[6]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() + 1
      );
    });

    it('supports 5-day working week with mondayFirst', () => {
      const weekReferenceDate = new Date(Date.UTC(2020, 8, 1, 0, 0, 0, 0));
      const monthData = calendarDates(weekReferenceDate, true, 5);

      expect(monthData).toHaveLength(6);
      expect(monthData.flatMap((week) => week)).toHaveLength(42);
      expect(monthData[0]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[1]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[2]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth()
      );
      expect(monthData[5]?.[6]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() + 1
      );
    });

    it('supports 7-day working week without mondayFirst for a Monday-start month', () => {
      // Sunday is last day of previous month
      const weekReferenceDate = new Date(Date.UTC(2021, 1, 1, 0, 0, 0, 0));
      const monthData = calendarDates(weekReferenceDate, false, 7);

      expect(monthData).toHaveLength(6);
      expect(monthData.flatMap((week) => week)).toHaveLength(42);

      // Sunday January
      expect(monthData[0]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      // Monday February
      expect(monthData[1]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth()
      );
      expect(monthData[2]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth()
      );
      expect(monthData[5]?.[6]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() + 1
      );
    });

    it('supports 6-day working week without mondayFirst for a Monday-start month', () => {
      const weekReferenceDate = new Date(Date.UTC(2021, 1, 1, 0, 0, 0, 0));
      const monthData = calendarDates(weekReferenceDate, false, 6);

      expect(monthData).toHaveLength(6);
      expect(monthData.flatMap((week) => week)).toHaveLength(42);
      expect(monthData[0]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[1]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[2]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth()
      );
      expect(monthData[5]?.[6]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() + 1
      );
    });

    it('supports 5-day working week without mondayFirst for a Monday-start month', () => {
      const weekReferenceDate = new Date(Date.UTC(2021, 1, 1, 0, 0, 0, 0));
      const monthData = calendarDates(weekReferenceDate, false, 5);

      expect(monthData).toHaveLength(6);
      expect(monthData.flatMap((week) => week)).toHaveLength(42);
      expect(monthData[0]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[1]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() - 1
      );
      expect(monthData[2]?.[0]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth()
      );
      expect(monthData[5]?.[6]?.date.getMonth()).toEqual(
        weekReferenceDate.getMonth() + 1
      );
    });

    it('uses holidayCallback to override default holiday detection', () => {
      const weekReferenceDate = new Date(Date.UTC(2020, 8, 1, 0, 0, 0, 0));
      const holidayCallback = vi.fn((date: Date) => date.getDate() === 2);
      const monthData = calendarDates(
        weekReferenceDate,
        false,
        7,
        holidayCallback
      );
      const allDays = monthData.flatMap((week) => week);

      expect(holidayCallback).toHaveBeenCalled();
      const secondOfMonth = allDays.find(
        (item) =>
          item.date.getMonth() === weekReferenceDate.getMonth() &&
          item.date.getDate() === 2
      );
      expect(secondOfMonth).toBeDefined();
      expect(secondOfMonth?.holiday).toBe(true);

      const sunday = allDays.find((item) => item.date.getDay() === 0);
      expect(sunday).toBeDefined();
      expect(sunday?.holiday).toBe(false);
    });
  });

  describe('datesSame', () => {
    const at = (dayOfMonth: number, hour = 0) =>
      new Date(2026, 2, dayOfMonth, hour);

    it('compares the exact timestamp by default', () => {
      expect(datesSame(at(9), at(9))).toBe(true);
      expect(datesSame(at(9), at(9, 1))).toBe(false);
    });

    it('ignores the time of day at date precision', () => {
      expect(datesSame(at(9), at(9, 23), 'date')).toBe(true);
      expect(datesSame(at(9), at(10, 1), 'date')).toBe(false);
    });

    it('returns false when one of the dates is missing', () => {
      expect(datesSame(undefined, at(9), 'date')).toBe(false);
      expect(datesSame(at(9), undefined)).toBe(false);
    });
  });

  describe('calendarDates holidayCallback', () => {
    it('keeps the Sunday default when the callback returns null', () => {
      const days = flattenDates(() => null);

      expect(days.some((day) => day.isSunday)).toBe(true);
      expect(
        days.filter((day) => day.isSunday).every((day) => day.holiday === true)
      ).toBe(true);
    });

    it('lets the callback disable the Sunday default', () => {
      const days = flattenDates(() => false);

      expect(days.some((day) => day.isSunday)).toBe(true);
      expect(days.every((day) => day.holiday === false)).toBe(true);
    });

    it('survives a throwing callback and warns in development', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const days = flattenDates((date) => {
          if (date.getDate() === 15) {
            throw new Error('holidayCallback boom');
          }
          return null;
        });

        // the failing day falls back to the default marking (not a holiday)
        expect(days.every((day) => day.holiday !== undefined)).toBe(true);
        expect(
          days
            .filter((day) => day.isSunday)
            .every((day) => day.holiday === true)
        ).toBe(true);
        expect(errorSpy).toHaveBeenCalled();
      } finally {
        errorSpy.mockRestore();
      }
    });
  });

  describe('setMonthSafe', () => {
    it('keeps the day of month when the target month is long enough', () => {
      expect(setMonthSafe(new Date(2026, 0, 15), 3)).toEqual(
        new Date(2026, 3, 15)
      );
    });

    it('clamps the day to the last day of a shorter month', () => {
      expect(setMonthSafe(new Date(2026, 0, 31), 1)).toEqual(
        new Date(2026, 1, 28)
      );
    });

    it('clamps to 29 February in a leap year', () => {
      expect(setMonthSafe(new Date(2028, 0, 31), 1)).toEqual(
        new Date(2028, 1, 29)
      );
    });

    it('clamps monthIndex to 0..11 and keeps the year', () => {
      expect(setMonthSafe(new Date(2026, 0, 15), 12)).toEqual(
        new Date(2026, 11, 15)
      );
      expect(setMonthSafe(new Date(2026, 5, 15), -1)).toEqual(
        new Date(2026, 0, 15)
      );
      expect(setMonthSafe(new Date(2026, 11, 31), 1)).toEqual(
        new Date(2026, 1, 28)
      );
    });

    it('preserves the time of day', () => {
      const result = setMonthSafe(new Date(2026, 0, 31, 13, 45, 30, 250), 1);

      expect(result.getHours()).toBe(13);
      expect(result.getMinutes()).toBe(45);
      expect(result.getSeconds()).toBe(30);
      expect(result.getMilliseconds()).toBe(250);
    });

    it('does not mutate the source date', () => {
      const source = new Date(2026, 0, 31, 10);

      setMonthSafe(source, 1);

      expect(source).toEqual(new Date(2026, 0, 31, 10));
    });
  });

  describe('setYearSafe', () => {
    it('keeps month and day for a regular date', () => {
      expect(setYearSafe(new Date(2026, 5, 15, 8, 30), 2027)).toEqual(
        new Date(2027, 5, 15, 8, 30)
      );
    });

    it('clamps 29 February in a non leap year', () => {
      expect(setYearSafe(new Date(2024, 1, 29), 2025)).toEqual(
        new Date(2025, 1, 28)
      );
    });

    it('does not mutate the source date', () => {
      const source = new Date(2024, 1, 29);

      setYearSafe(source, 2025);

      expect(source).toEqual(new Date(2024, 1, 29));
    });
  });

  describe('month arithmetic across the year boundary', () => {
    it('moves December to January of the next year', () => {
      expect(add(new Date(2026, 11, 15), 1, 'month')).toEqual(
        new Date(2027, 0, 15)
      );
      expect(add(new Date(2026, 11, 31), 1, 'month')).toEqual(
        new Date(2027, 0, 31)
      );
    });

    it('moves January back to December of the previous year', () => {
      expect(subtract(new Date(2027, 0, 15), 1, 'month')).toEqual(
        new Date(2026, 11, 15)
      );
      expect(subtract(new Date(2027, 0, 31), 1, 'month')).toEqual(
        new Date(2026, 11, 31)
      );
    });

    it('handles multi month steps spanning one or more years', () => {
      expect(add(new Date(2026, 11, 15), 3, 'month')).toEqual(
        new Date(2027, 2, 15)
      );
      expect(add(new Date(2026, 11, 15), 13, 'month')).toEqual(
        new Date(2028, 0, 15)
      );
      expect(subtract(new Date(2027, 0, 15), 13, 'month')).toEqual(
        new Date(2025, 11, 15)
      );
    });

    it('still clamps the day of month across the boundary', () => {
      expect(subtract(new Date(2027, 2, 31), 1, 'month')).toEqual(
        new Date(2027, 1, 28)
      );
      expect(add(new Date(2024, 1, 29), 12, 'month')).toEqual(
        new Date(2025, 1, 28)
      );
    });

    it('keeps the time of day and does not mutate the source date', () => {
      const source = new Date(2026, 11, 31, 23, 59, 58, 700);

      const result = add(source, 1, 'month');

      expect(result).toEqual(new Date(2027, 0, 31, 23, 59, 58, 700));
      expect(source).toEqual(new Date(2026, 11, 31, 23, 59, 58, 700));
    });
  });
});

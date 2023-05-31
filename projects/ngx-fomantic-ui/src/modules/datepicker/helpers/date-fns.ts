import { IDatepickerLocaleValues } from "../../../behaviors/localization/internal";
import { format, parse } from "date-fns";
import defaultLocale from "date-fns/locale/en-GB";

interface IDateFnsLocaleValues {
  [name: string]: string[];
}

interface IDateFnsHelperOptions {
  width: string;
}

type DateFnsHelper<U, T> = (value: U, options: IDateFnsHelperOptions) => T;
type DateFnsWeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type LocalePatternWidth =
  | 'narrow'
  | 'short'
  | 'abbreviated'
  | 'wide'
  | 'any'

interface IDateFnsCustomLocale {
  code?: string;
  formatDistance?: (...args: Array<any>) => any;
  formatRelative?: (...args: Array<any>) => any;
  localize?: {
    ordinalNumber: (...args: Array<any>) => any;
    era: (...args: Array<any>) => any;
    quarter: (...args: Array<any>) => any;
    month: (...args: Array<any>) => any;
    day: (...args: Array<any>) => any;
    dayPeriod: (...args: Array<any>) => any;
  };
  formatLong?: {
    date: (...args: Array<any>) => any;
    time: (...args: Array<any>) => any;
    dateTime: (...args: Array<any>) => any;
  };
  match?: {
    ordinalNumber: (...args: Array<any>) => any;
    era: (...args: Array<any>) => any;
    quarter: (...args: Array<any>) => any;
    month: (...args: Array<any>) => any;
    day: (...args: Array<any>) => any;
    dayPeriod: (...args: Array<any>) => any;
  };
  options?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  };
}

function buildLocalizeFn(
  values: IDateFnsLocaleValues,
  defaultType: LocalePatternWidth,
  indexCallback?: (oldIndex: number) => number
): DateFnsHelper<number, string> {
  return (dirtyIndex: number, { width } = { width: defaultType }) => {
    const index = indexCallback ? indexCallback(dirtyIndex) : dirtyIndex;

    return values[width][index];
  };
}

function buildLocalizeArrayFn(
  values: IDateFnsLocaleValues,
  defaultType: string
): DateFnsHelper<IDateFnsHelperOptions, string[]> {
  return ({ width } = { width: defaultType }) => values[`${width}`];
}

function buildMatchFn(
  patterns: IDateFnsLocaleValues,
  defaultType: string
): DateFnsHelper<string, RegExpMatchArray | null> {
  return (dirtyString, { width } = { width: defaultType }) => {
    return dirtyString.match(`^(${patterns[`${width}`].join("|")})`);
  };
}

function buildParseFn(
  patterns: IDateFnsLocaleValues,
  defaultType: string
): DateFnsHelper<RegExpMatchArray, number> {
  return ([, result], { width } = { width: defaultType }) =>
    (patterns[`${width}`] || patterns[defaultType])
      .map((p) => new RegExp(`^${p}`))
      .findIndex((pattern) => pattern.test(result));
}

export class DateFnsParser {
  private _weekStartsOn: DateFnsWeekStartsOn;
  private _locale: IDateFnsCustomLocale;

  constructor(locale: IDatepickerLocaleValues) {
    this._weekStartsOn = locale.firstDayOfWeek as DateFnsWeekStartsOn;

    const weekdayValues = {
      long: locale.weekdays,
      wide: locale.weekdays,
      short: locale.weekdaysShort,
      narrow: locale.weekdaysNarrow,
    };

    const monthValues = {
      long: locale.months,
      wide: locale.months,
      short: locale.monthsShort,
    };

    const timeOfDayValues = {
      long: locale.timesOfDay,
      wide: locale.timesOfDay,
      uppercase: locale.timesOfDayUppercase,
      lowercase: locale.timesOfDayLowercase,
    };

    const timeOfDayMatchValues = {
      long: locale.timesOfDay,
      wide: locale.timesOfDay,
      short: locale.timesOfDayUppercase.concat(locale.timesOfDayLowercase),
    };

    this._locale = defaultLocale;

    this._locale.localize = {
      ...this._locale.localize,
      ...{
        weekday: buildLocalizeFn(weekdayValues, "wide"),
        weekdays: buildLocalizeArrayFn(weekdayValues, "long"),
        month: buildLocalizeFn(monthValues, "wide"),
        months: buildLocalizeArrayFn(monthValues, "long"),
        timeOfDay: buildLocalizeFn(timeOfDayValues, "wide", (hours: number) => {
          return hours / 12 >= 1 ? 1 : 0;
        }),
        timesOfDay: buildLocalizeArrayFn(timeOfDayValues, "long"),
      },
    };
    this._locale.match = {
      ...this._locale.match,
      ...{
        weekdays: buildMatchFn(weekdayValues, "long"),
        weekday: buildParseFn(weekdayValues, "long"),
        months: buildMatchFn(monthValues, "long"),
        month: buildParseFn(monthValues, "long"),
        timesOfDay: buildMatchFn(timeOfDayMatchValues, "long"),
        timeOfDay: buildParseFn(timeOfDayMatchValues, "long"),
      },
    };
  }

  private get _config() {
    return {
      weekStartsOn: this._weekStartsOn,
      locale: this._locale,
    };
  }

  public format(d: Date, f: string): string {
    return format(d, f, this._config);
  }

  public parse(dS: string, f: string, bD: Date): Date {
    return parse(dS, f, new Date(), this._config);
  }
}

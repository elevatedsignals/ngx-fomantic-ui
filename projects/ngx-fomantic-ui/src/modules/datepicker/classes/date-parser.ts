import { DateFnsParser } from "../helpers/date-fns";
import {
  IDatepickerFormatsLocaleValues,
  IDatepickerLocaleValues,
} from "../../../behaviors/localization/internal";
import { DatepickerMode } from "../helpers/date-picker-mode";

export class DateParser {
  private _format: string;
  private _parser: DateFnsParser;

  constructor(format: string, locale: IDatepickerLocaleValues) {
    this._format = format;
    this._parser = new DateFnsParser(locale);
  }

  public format(date: Date): string {
    return this._parser.format(date, this._format);
  }

  public parse(dateString: string, baseDate: Date = new Date()): Date {
    return this._parser.parse(dateString, this._format, baseDate);
  }
}

export class InternalDateParser extends DateParser {
  constructor(mode: DatepickerMode, locale: IDatepickerLocaleValues) {
    const internalFormats: IDatepickerFormatsLocaleValues = {
      time: "HH:mm",
      datetime: "yyyy-MM-ddTHH:mm",
      date: "yyyy-MM-dd",
      month: "yyyy-MM",
      year: "yyyy",
    };

    super(internalFormats[mode], locale);
  }
}

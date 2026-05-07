import {Component, Renderer2} from '@angular/core';
import {DatePrecision} from '../../../misc/util/internal';
import {CalendarView, CalendarViewType} from './calendar-view';
import {CalendarItem} from '../directives/calendar-item';
import {CalendarRangeService} from '../services/calendar-range.service';
import {DateParser} from '../classes/date-parser';

export class CalendarRangeMonthService extends CalendarRangeService {
  public configureItem(item: CalendarItem, baseDate: Date): void {
    item.humanReadable = this.service.localeValues.monthsShort[item.date.getMonth()];
    item.isOutsideRange = false;
  }
}

@Component({
    selector: 'fui-calendar-month-view',
    template: `
<table class="ui celled center aligned unstackable table three column month">
  <thead>
    <tr>
      <th colspan="3">
        <fui-calendar-view-title [ranges]="ranges" (zoomOut)="zoomOut()">
          {{ year }}
        </fui-calendar-view-title>
      </th>
    </tr>
  </thead>
  <tbody>
    @for (group of ranges.current.groupedItems; track group) {
      <tr>
        @for (item of group; track item) {
          <td class="link"
            [calendarItem]="item"
            (click)="setDate(item)">{{ item.humanReadable }}
          </td>
        }
      </tr>
    }
  </tbody>
</table>
`,
    standalone: false
})
export class FuiCalendarMonthView extends CalendarView {
  constructor(renderer: Renderer2) {
    super(renderer, CalendarViewType.Month, new CalendarRangeMonthService(DatePrecision.Year, 4, 3));
  }

  public get year(): string {
    return new DateParser(this.service.localeValues.formats.year, this.service.localeValues).format(this.currentDate);
  }
}

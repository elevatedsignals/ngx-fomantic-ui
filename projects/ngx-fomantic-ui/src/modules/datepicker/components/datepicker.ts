import {Component, HostBinding, HostListener} from '@angular/core';
import {CalendarService} from './../services/calendar.service';
import {DatetimeConfig} from '../classes/calendar-config';
import {FuiLocalizationService} from '../../../behaviors/localization/internal';

@Component({
  selector: 'fui-datepicker',
  template: `
@switch (service.currentView) {
  @case (0) {
    <fui-calendar-year-view [service]="service"></fui-calendar-year-view>
  }
  @case (1) {
    <fui-calendar-month-view [service]="service"></fui-calendar-month-view>
  }
  @case (2) {
    <fui-calendar-date-view [service]="service"></fui-calendar-date-view>
  }
  @case (3) {
    <fui-calendar-hour-view [service]="service"></fui-calendar-hour-view>
  }
  @case (4) {
    <fui-calendar-minute-view [service]="service"></fui-calendar-minute-view>
  }
}
`,
  styles: [`
:host {
    user-select: none;
}
`]
})
export class FuiDatepicker {
  @HostBinding('class.ui')
  @HostBinding('class.active')
  @HostBinding('class.calendar')
  public readonly hasClasses: boolean;

  public service: CalendarService;

  constructor(localizationService: FuiLocalizationService) {
    this.service = new CalendarService(new DatetimeConfig(), localizationService.get().datepicker);

    this.hasClasses = true;
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(e: MouseEvent): void {
    e.preventDefault();
  }
}

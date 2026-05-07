import {Directive, TemplateRef} from '@angular/core';

@Directive({
    selector: 'ng-template[fuiToastTitle]',
    standalone: false
})
export class FuiToastTitle {
  constructor(public templateRef: TemplateRef<any>) {
  }
}

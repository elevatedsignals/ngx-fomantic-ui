import {Directive, TemplateRef} from '@angular/core';

@Directive({
    selector: 'ng-template[fuiToastMessage]',
    standalone: false
})
export class FuiToastMessage {
  constructor(public templateRef: TemplateRef<any>) {
  }
}

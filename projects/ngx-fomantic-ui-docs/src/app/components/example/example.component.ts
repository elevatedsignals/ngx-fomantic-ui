import { Component, Input } from '@angular/core';

@Component({
    selector: 'demo-example',
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.css'],
    standalone: false
})
export class ExampleComponent {
    public detail = false;

    @Input()
    public code: string;
}

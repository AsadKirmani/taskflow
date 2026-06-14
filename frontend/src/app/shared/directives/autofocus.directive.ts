import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[appAutofocus]',
    standalone: true
})

export class AutofocusDirective implements AfterViewInit {
    constructor(private el: ElementRef<HTMLInputElement>) {}
    ngAfterViewInit() {
        setTimeout(() => {
            this.el.nativeElement.focus();
        }, 0);
    }
}
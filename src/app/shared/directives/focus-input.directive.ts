import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
	selector: '[appFocusInput]'
})
export class FocusInputDirective implements OnInit {
	@Input('appFocusInput') isFocused: boolean;
	@Input() defaultValue: string;

	constructor(private el: ElementRef) {}

	ngOnInit() {
		if (this.isFocused && !this.defaultValue && !this.el.nativeElement.value) {
			this.el.nativeElement.focus();
		}
	}
}

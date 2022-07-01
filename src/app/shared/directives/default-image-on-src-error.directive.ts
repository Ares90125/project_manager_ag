import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';

@Directive({
	selector: '[appDefaultImageSrc]'
})
export class DefaultImageOnSrcErrorDirective implements OnDestroy {
	@Input('appDefaultImageSrc') imgSrc: string;
	private el: HTMLElement;
	private isApplied: boolean = false;
	private EVENT_TYPE: string = 'error';

	constructor(el: ElementRef) {
		this.el = el.nativeElement;
		this.el.addEventListener(this.EVENT_TYPE, this.onError.bind(this));
	}

	ngOnDestroy() {
		this.removeEvents();
	}

	private onError() {
		this.removeEvents();

		if (!this.isApplied) {
			this.isApplied = true;
			this.el.setAttribute('src', this.imgSrc);
		}
	}

	private removeEvents() {
		this.el.removeEventListener(this.EVENT_TYPE, this.onError);
	}
}
